import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PLACEHOLDER_CLIENT_SECRET",
    }),
    CredentialsProvider({
      name: 'Tài khoản Test nghiệm',
      credentials: {
        username: { label: "Tên đăng nhập", type: "text", placeholder: "admin" },
        password: { label: "Mật khẩu", type: "password", placeholder: "admin" }
      },
      async authorize(credentials) {
        // Cho phép đăng nhập với bất kỳ tài khoản nào để test dễ dàng
        if (credentials?.username) {
          return {
            id: "1", 
            name: credentials.username,
            email: `${credentials.username}@example.com`,
            image: "https://ui-avatars.com/api/?name=" + credentials.username
          }
        }
        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "PLACEHOLDER_NEXTAUTH_SECRET_KEY_FOR_DEV_ONLY",
})

export { handler as GET, handler as POST }
