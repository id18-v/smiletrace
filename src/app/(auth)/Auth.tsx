import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger } from "@/components/ui/dialog";
import { GoogleAuthButton } from "@/components/ui/SubmitButon";
import { signIn } from "@/lib/auth";
import Image from "next/image";

export function AuthModal() {
  return (
    <Dialog>
      <DialogTrigger asChild >
        <Button className="bg-blue-500 text-black w-[200px] h-[50px] "><h1 >Try</h1></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader className="flex flex-row  items-center gap-2">
          <Image src="/images/SmileTrace.png" alt="Smile" className="size-10" width={40} height={40}/>
          <DialogTitle className="text-3xl font-semibold">
            Smile <span className="text-primary">Trace</span>
          </DialogTitle>
        </DialogHeader>
        <div>
          <form action={async () => {
            "use server"
            await signIn("google");
          }} className="w-full">
            <GoogleAuthButton />
          </form>
        </div>
      </DialogContent>
    </Dialog>   
  )
}
