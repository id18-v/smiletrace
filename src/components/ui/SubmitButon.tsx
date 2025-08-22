"use client"

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";

export function GoogleAuthButton(){
   const { pending } = useFormStatus();

    return (
        <>
          {pending ?(
            <Button disabled variant="outline" className="w-full">
                <Loader2 className="size-4 mr-2 animate-spin"/>
                Signing in...
            </Button>
          ) : (
              <Button className="w-full" variant="outline" type="submit">
                  <Image src="/icons8-google.svg" alt="Google logo" className="size-4 mr-2" width={16} height={16} />
                  Sign in with Google
              </Button>
           
          )}
        </>
    );
}
