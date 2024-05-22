import LoginButtons from "./LoginButtons";

export function LoginView() {
  return (
    <div className="max-w-140 grid h-fit max-h-124 w-full select-none grid-cols-8 grid-rows-8 overflow-hidden rounded  bg-stone-900  text-center font-semibold">
      <div className="row-span-full hidden  overflow-hidden sm:col-span-3 sm:block">
        <img
          className="h-full w-full object-cover object-right-top"
          src="/auth/login_banner_vertical.png"
        />
      </div>
      <div className="col-span-full row-span-full grid grid-cols-subgrid grid-rows-subgrid pt-3 sm:col-span-5 ">
        <div className="col-span-full row-span-2 flex flex-col gap-1 font-semibold">
          <span className="text-3xl">login</span>
          <span className="text-xl">start playing today</span>
        </div>
        <div className="col-span-full row-span-2 flex flex-col gap-2 p-3">
          Continue with
          <LoginButtons />
        </div>
      </div>
    </div>
  );
}
