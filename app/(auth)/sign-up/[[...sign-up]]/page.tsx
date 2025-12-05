import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border border-[#E5E2DD] bg-white",
            headerTitle: "font-headline text-[#1A1A1A]",
            headerSubtitle: "font-body text-[#8B8680]",
            formButtonPrimary: "bg-[#1A1A1A] hover:bg-[#333]",
            footerActionLink: "text-[#C45D3A] hover:text-[#A84D2E]",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </div>
  )
}
