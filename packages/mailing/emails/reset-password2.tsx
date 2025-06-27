import React, { CSSProperties } from "react";
import { Body, Head, Html, Section, Text } from "@react-email/components";

type Props = {
  validationCode: string;
  requesterInfo: {
    userAgent: string;
    location: string;
    device: string;
  };
};

const ResetPasswordEmailTemplate = ({
  validationCode,
  requesterInfo,
}: Props) => (
  <Html>
    <Head />
    <Body style={main}>
      <Text style={tertiary}>RESET YOUR PASSWORD</Text>
      <Text style={{ ...secondary, marginBottom: "10px" }}>
        Use this code to verify your identity
      </Text>
      <Text style={{ ...paragraph }}>
        You recently requested to reset your password. <br />
        To verify your identity, please enter the code below:
      </Text>
      <Text style={tertiary}>REQUESTER INFORMATION</Text>
      <Section
        style={{
          ...codeContainer,
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
        }}
      >
        <Text style={userAgentInfoText}>
          Location: <strong>{requesterInfo?.location}</strong>
        </Text>
        <Text style={userAgentInfoText}>
          Device: <strong>{requesterInfo?.device}</strong>
        </Text>
        <Text style={{ ...userAgentInfoText, marginBottom: 0 }}>
          User Agent: <strong>{requesterInfo?.userAgent}</strong>
        </Text>
      </Section>
      <Text style={tertiary}>VERIFICATION CODE</Text>
      <Section style={codeContainer}>
        <Text style={code}>{validationCode}</Text>
      </Section>
      <Text style={paragraph}>
        This code will expire in 10 minutes. <br />
        If you didn't request this, please ignore this email.
      </Text>
    </Body>
  </Html>
);

ResetPasswordEmailTemplate.PreviewProps = {
  validationCode: "144833",
  requesterInfo: {
    ipAddress: "127.0.0.1",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    location: "San Francisco, CA",
    device: "Desktop",
  },
};

export default ResetPasswordEmailTemplate;

const userAgentInfoText: CSSProperties = {
  marginTop: 0,
  marginBottom: 5,
  marginLeft: 0,
  marginRight: 0,
};

const main: CSSProperties = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const tertiary: CSSProperties = {
  color: "#0a85ea",
  fontSize: "11px",
  fontWeight: 700,
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  height: "16px",
  letterSpacing: "0",
  lineHeight: "16px",
  margin: "16px 8px 8px 8px",
  textTransform: "uppercase",
  textAlign: "center",
};

const secondary: CSSProperties = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
  fontSize: "20px",
  fontWeight: 500,
  lineHeight: "24px",
  marginBottom: "0",
  marginTop: "0",
  textAlign: "center",
};

const codeContainer: CSSProperties = {
  background: "rgba(0,0,0,.05)",
  borderRadius: "10px",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  width: "280px",
};

const code: CSSProperties = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Bold",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "6px",
  lineHeight: "40px",
  paddingBottom: "8px",
  paddingTop: "8px",
  margin: "0 auto",
  width: "100%",
  textAlign: "center",
};

const paragraph: CSSProperties = {
  color: "#444",
  fontSize: "15px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  letterSpacing: "0",
  lineHeight: "23px",
  padding: "0 40px",
  margin: "0",
  textAlign: "center",
};
