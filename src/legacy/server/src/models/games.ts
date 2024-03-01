import { UUID } from "@common/src/types/misc"
import { GameSummary } from "@common/src/types/game"
import mongoose,{Schema} from "mongoose"


export const gameSchema = new Schema<GameSummary>({
    id:{
        type:String,
        required:true,
    },
    players:{
        w:{
            id:{
                type:String,
                required:true,
            },
            displayName:{
                type:String,
                required:true,
            },
        },
        b:{
            id:{
                type:String,
                required:true,
            },
            displayName:{
                type:String,
                required:true,
            },
        }
    },
    conclusion:{
        termination:{
            type:String,
            required:true,
        },
        victor:{
            type:Schema.Types.Mixed,
            required:true,
        },
        boardState:{
            type:String,
            required:true,
        },
    },
    moves:{
        type:[String],
        required:true,
    },
    time:{
        start:{
            type:Number,
            required:true,
        },
        end:{
            type:Number,
            required:true,
        },
        duration:{
            type:Number,
            required:true,
        },
    },
}) 

export const GameModel = mongoose.model("game",gameSchema)
