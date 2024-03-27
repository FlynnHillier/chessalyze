import { v1 as uuidv1 } from "uuid";

import { GameInstance } from "./GameInstance";
import { Lobby, Player } from "~/types/game.types";
import { UUID } from "~/types/common.types";

import { createGameRoom } from "~/lib/ws/rooms/game.room.ws";
import { emitGameEndEvent } from "~/lib/ws/events/game/game.end.event.ws";
import { emitGameJoinEvent } from "~/lib/ws/events/game/game.join.event.ws";
import { wsRoomRegistry } from "~/lib/ws/rooms.ws";

class GameInstanceManagerClass {
  public gameInstances: GameInstance[] = [];
  public gameLobbys: Lobby[] = [];

  constructor() {}

  public getPlayerGame(uuid: UUID): null | GameInstance {
    const game = this.gameInstances.find(
      (game) => game.players.w.pid === uuid || game.players.b.pid === uuid,
    );
    return game !== undefined ? game : null;
  }

  public getGame(gameID: UUID): null | GameInstance {
    const game = this.gameInstances.find((game) => game.id === gameID);
    return game !== undefined ? game : null;
  }

  public newGame(p1: Player, p2: Player, uuid?: string): GameInstance {
    const newGameInstance = new GameInstance(p1, p2, {
      w: 30000,
      b: 30000,
    });
    const gameRoom = createGameRoom({
      room: newGameInstance.id,
      uids: [p1.pid, p2.pid],
    });

    newGameInstance.setEventCallback("conclusion", () => {
      this.gameInstances.splice(this.gameInstances.indexOf(newGameInstance), 1);

      //TODO: Add db store here

      emitGameEndEvent(gameRoom, {});
      wsRoomRegistry.destroy(newGameInstance.id);
    });

    emitGameJoinEvent(gameRoom, newGameInstance.snapshot());

    this.gameInstances.push(newGameInstance);
    return newGameInstance;
  }

  public getPlayerLobby(uuid: UUID): null | Lobby {
    const lobby = this.gameLobbys.find((lobby) => lobby.player.pid === uuid);
    return lobby === undefined ? null : lobby;
  }

  public getLobby(lobbyID: UUID): null | Lobby {
    const lobby = this.gameLobbys.find((lobby) => lobby.id === lobbyID);
    return lobby === undefined ? null : lobby;
  }

  public createLobby(player: Player): Lobby {
    const newLobby: Lobby = {
      //create new lobby
      player,
      id: uuidv1(),
    };
    // socketManagment.join(player.id, `lobby:${newLobby.id}`)
    // io.to(`lobby:${newLobby.id}`).emit("lobby:joined", newLobby.id)

    this.gameLobbys.push(newLobby);
    return newLobby;
  }

  public joinLobby({
    targetLobbyID,
    player,
  }: {
    targetLobbyID: UUID;
    player: Player;
  }): GameInstance | null {
    const lobby = this.getLobby(targetLobbyID);
    if (lobby === null) {
      return null;
    }
    this.endLobby(lobby.id); //on join cease lobby existence as game is created.

    return this.newGame(
      {
        pid: lobby.player.pid,
      },
      {
        pid: player.pid,
      },
    );
  }

  public endLobby(lobbyID: UUID): void {
    const lobby = this.getLobby(lobbyID);
    if (lobby !== null) {
      this.gameLobbys.splice(this.gameLobbys.indexOf(lobby), 1);
      // io.to(`lobby:${lobby.id}`).emit("lobby:ended", lobby.id)
      // socketManagment.leave(lobby.player.id, `lobby:${lobby.id}`)
    }
  }

  public playerIsInLobby(playerID: UUID): boolean {
    return this.getPlayerLobby(playerID) === null;
  }
}

export const GameInstanceManager = new GameInstanceManagerClass();
