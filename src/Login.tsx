import {
  Button,
  Card,
  CardBody,
  Divider,
  Heading,
  HStack,
  Input,
  Stack,
} from "@chakra-ui/react";
import {
  AuthProvider,
  PaperEmbeddedWalletSdk,
} from "@paperxyz/embedded-wallet-service-sdk";
import { useState } from "react";

interface Props {
  paper: PaperEmbeddedWalletSdk | undefined;
  onLoginSuccess: () => void;
}

export const Login: React.FC<Props> = ({ paper, onLoginSuccess }) => {
  const [emailAddress, setEmailAddress] = useState<string>("");
  const loginWithGoogle = async () => {
    const res = await paper?.auth.initializeSocialOAuth({
                        authProvider: AuthProvider.GOOGLE,
                        redirectUri: "https://ews-demo.netlify.app", //http://localhost:3000", //https://ews-demo.withpaper.com",
                      });
    console.log("initializeSocialOAuth", res);
  };

  const loginWithEmail = async () => {
    const result = await paper?.auth.loginWithOtp({
      email: emailAddress,
    });
    console.log(`loginWithEmail result: ${result}`);
    onLoginSuccess();
  };

  return (
    <Card bg="white" borderRadius={8}>
      <CardBody>
        <Heading size="md">Log in</Heading>
        <Divider my={4} />
        <Stack>
          <Input
            type="text"
            placeholder="Email address"
            value={emailAddress}
            onChange={(e) => {
              setEmailAddress(e.target.value);
            }}
          />
          <HStack justify="end">
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={loginWithGoogle}
            >
              Log in with Google
            </Button>

            <Button
              colorScheme="blue"
              disabled={!emailAddress}
              onClick={loginWithEmail}
            >
              Log in with Email
            </Button>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};
