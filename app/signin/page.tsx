import { signIn } from "@/auth";

export default async function SignInPage(props: {
  searchParams: { callbackUrl: string | undefined; error?: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <div className="bg-white p-6 rounded shadow-md w-80">
        {props.searchParams.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {props.searchParams.error === "AccessDenied"
              ? "Acceso denegado. Intenta de nuevo."
              : props.searchParams.error}
          </div>
        )}
        <div className="mt-4 text-center">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/admin" });
            }}
          >
            <p>Or sign in with</p>
            <button className="mt-2 bg-blue-500 text-white py-2 px-4 rounded">
              Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
