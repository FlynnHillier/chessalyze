"use client";

import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { PromotionSymbol, Color, Square } from "~/types/game.types";
import { Move } from "chess.js";
import { PromotionPieceOption, Piece } from "react-chessboard/dist/chessboard/types";

type Movement = {
  source: Square;
  target: Square;
  promotion?: PromotionSymbol;
};

type Props = {
  chess: Chess;
  orientation: Color;
  FEN: string;
  onMovement: (move: Movement) => boolean;
};

//TODO
// - Once pull request to react-chessboard is accepted, implement support using onPieceSelect event prop
// - Respect the boolean values returned from react chessboard events, implement async support if possible.

export function ChessBoard({ chess, orientation, onMovement, FEN }: Props) {
  const [selectedTile, setSelectedTile] = useState<null | Square>(null);
  const [pendingMovement, setPendingMovement] = useState<null | Movement>(null);
  const [promotionToSquare, setPromotionToSquare] = useState<undefined | Square>();

  /**
   * generated styles for chess board tiles based on selected tile
   */
  const customSquareStyles = useMemo(() => {
    if (!selectedTile) return {};

    const getTileCSS = (occupied: boolean) => {
      const css: CSSProperties = {
        backgroundPosition: "center",
        backgroundSize: "cover",
        cursor: "pointer",
        backgroundImage: occupied
          ? "url(/chess/overlay/TileHintOccupied.png)"
          : "url(/chess/overlay/TileHintEmpty.png)",
      };

      return css;
    };

    return (chess.moves({ verbose: true, square: selectedTile }) as Move[]).reduce(
      (acc, { to, captured }) => {
        return { ...acc, [to]: getTileCSS(captured != null) };
      },
      {} as { [key in Square]: CSSProperties },
    );
  }, [selectedTile]);

  function onMovementAttempt({ source, target, promotion }: Movement): boolean {
    const moves = chess.moves({ verbose: true }) as Move[];
    const move = moves.find((m) => m.from == source && m.to == target);

    if (!move) return false;
    // if (move.color != orientation) return false;
    if (move.promotion && !promotion) {
      awaitPromotion({ source, target });
      return false;
    }

    return onMovement({ source, target, promotion });
  }

  function awaitPromotion(move: Movement) {
    setPendingMovement(move);
    setPromotionToSquare(move.target);
  }

  function onPromotionPieceSelect(piece?: PromotionPieceOption) {
    setPromotionToSquare(undefined);

    if (!pendingMovement || !piece) return false;

    //This is a sort of hacky fix because PromotionPieceOption returns <colour><promotion> e.g 'wB' instead of PromotionSymbol <promotion>
    const promotionOption = piece[1].toLowerCase() as PromotionSymbol;

    onMovementAttempt({ ...pendingMovement, promotion: promotionOption });

    return false;
  }

  function onPromotionCheck(source: Square, target: Square, piece: Piece) {
    const isPromotionMove =
      ((piece === "wP" && source[1] === "7" && target[1] === "8") ||
        (piece === "bP" && source[1] === "2" && target[1] === "1")) &&
      Math.abs(source.charCodeAt(0) - target.charCodeAt(0)) <= 1;

    if (isPromotionMove) setPendingMovement({ source, target });

    return isPromotionMove;
  }

  function onPieceDrop(sourceTile: Square, targetTile: Square, piece: string): false {
    onMovementAttempt({
      source: sourceTile,
      target: targetTile,
    });
    return false;
  }

  function onSquareClick(square: Square) {
    if (selectedTile) {
      if (onMovementAttempt({ source: selectedTile, target: square })) return setSelectedTile(null);
    }

    setSelectedTile(square);
  }

  return (
    <div className="w-full min-w-28">
      <Chessboard
        boardOrientation={orientation === "b" ? "black" : "white"}
        position={FEN}
        customSquareStyles={customSquareStyles}
        customBoardStyle={{
          width: "100%",
          boxSizing: "border-box",
        }}
        onPieceDrop={onPieceDrop}
        onPromotionPieceSelect={onPromotionPieceSelect}
        promotionToSquare={promotionToSquare}
        showPromotionDialog={!!promotionToSquare}
        onSquareClick={onSquareClick}
        onPromotionCheck={onPromotionCheck}
      />
    </div>
  );
}
