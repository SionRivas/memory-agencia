import { SignOut } from "@/components/SignOut";
import UploadForm from "@/components/UploadForm";
import UserAvatar from "@/components/UserAvatar";

export default function AdminPage() {
  return (
    <div>
      <UserAvatar />
      <SignOut />
      <h1>Admin Page</h1>
      <UploadForm />
    </div>
  );
}
