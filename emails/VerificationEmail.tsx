import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
  type?: "signup" | "login";
}

export default function VerificationEmail({
  username,
  otp,
  type = "signup",
}: VerificationEmailProps) {
  const isLogin = type === "login";

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>
          {isLogin ? "Login Verification Code" : "Verification Code"}
        </title>

        <Font
          fontFamily="Archivo Black"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/archivoblack/v21/HTxqL289NzCGg4MzN6KJ7eW6CYyF-hPU.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Preview>
        {isLogin
          ? `Your login verification code is: ${otp}`
          : `Here's your verification code: ${otp}`}
      </Preview>

      <Section
        style={{
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "10px",
        }}
      >
        <Row>
          <Heading
            as="h2"
            style={{
              color: "#574f87",
              marginBottom: "20px",
            }}
          >
            Hello {username},
          </Heading>
        </Row>

        <Row>
          <Text
            style={{
              fontSize: "16px",
              color: "#333333",
              lineHeight: "24px",
            }}
          >
            {isLogin
              ? "Someone is trying to log in to your Kisan Inter College account. Please use the verification code below to complete your login:"
              : "Thank you for registering. Please use the following verification code to complete your registration:"}
          </Text>
        </Row>

        <Row>
          <Text
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              letterSpacing: "8px",
              textAlign: "center",
              color: "#574f87",
              backgroundColor: "#f3f1ff",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            {otp}
          </Text>
        </Row>

        <Hr
          style={{
            borderColor: "#e5e5e5",
            margin: "25px 0",
          }}
        />

        <Row>
          <Text
            style={{
              fontSize: "14px",
              color: "#666666",
            }}
          >
            This verification code will expire in 5 minutes.
          </Text>
        </Row>

        <Row>
          <Text
            style={{
              fontSize: "14px",
              color: "#666666",
            }}
          >
            If you didn't request this code, please ignore this email.
          </Text>
        </Row>

        <Row>
          <Text
            style={{
              fontSize: "13px",
              color: "#999999",
              marginTop: "20px",
            }}
          >
            © Kisan Inter College
          </Text>
        </Row>
      </Section>
    </Html>
  );
}