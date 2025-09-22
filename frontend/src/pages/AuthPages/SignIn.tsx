import PageMeta from "../../components/common/PageMeta"
import AuthLayout from "./AuthPageLayout"
import SignInForm from "../../components/auth/SignInForm"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"

export default function SignIn() {
  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | เข้าสู่ระบบ`}
        description={WEBSITE_DESCRIPTION}
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  )
}
