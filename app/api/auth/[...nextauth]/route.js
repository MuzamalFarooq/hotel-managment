import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import Staff from "@/models/Staff";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        await dbConnect();

        // 1. Auto-seed a default General Manager if there are no staff members at all
        const staffCount = await Staff.countDocuments({});
        if (staffCount === 0) {
          const hashedPassword = bcrypt.hashSync("password123", 10);
          await Staff.create({
            name: "Admin User",
            username: "admin",
            password: hashedPassword,
            email: "admin@grandstay.com",
            phone: "1234567890",
            role: "General Manager",
            status: "Active",
            image: "https://i.pravatar.cc/150?u=admin"
          });
        }

        // 2. Find the staff member
        const user = await Staff.findOne({ username: credentials.username });
        if (!user) {
          throw new Error("Invalid username or password");
        }

        // 3. Check status
        if (user.status !== "Active") {
          throw new Error("Your account has been deactivated. Please contact the administrator.");
        }

        // 4. Verify password
        const isValidPassword = bcrypt.compareSync(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid username or password");
        }

        // Return user session data
        return {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          role: user.role,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "grand_stay_management_secret_key_1234567890",
  pages: {
    signIn: "/login",
    error: "/login"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
