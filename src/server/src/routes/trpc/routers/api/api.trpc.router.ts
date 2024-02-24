import { t } from "../../init.trpc"

export const trpcApiRouter = t.router({
    hello:t.procedure.query(()=>"hello charva")
})