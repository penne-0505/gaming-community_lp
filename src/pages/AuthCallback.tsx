import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureError } from "../analytics";
import {
  consumeDiscordOAuthState,
  exchangeDiscordCode,
  extractDiscordOAuthParams,
} from "../utils/discordAuth";

const AuthCallback = () => {
  const location = useLocation();

  useEffect(() => {
    const { code, state } = extractDiscordOAuthParams(window.location.href);

    if (!code) {
      window.location.replace("/membership");
      return;
    }

    const parsedState = consumeDiscordOAuthState(state);
    if (!parsedState?.returnTo || !parsedState.returnTo.startsWith("/")) {
      captureError(new Error("Invalid OAuth state"), { stateValue: state });
      window.location.replace("/membership?auth=invalid");
      return;
    }

    const targetPath = parsedState.returnTo;

    (async () => {
      const result = await exchangeDiscordCode(code, {
        errorStage: "oauth_callback",
      });
      if (!result.ok) {
        window.location.replace("/membership?auth=failed");
        return;
      }

      const targetUrl = new URL(targetPath, window.location.origin);
      window.location.replace(targetUrl.toString());
    })();
  }, [location.key]);

  return (
    <div className="min-h-screen flex items-center justify-center token-bg-main token-text-primary">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 token-border-accent mx-auto mb-4"></div>
        <p className="font-bold">Discord 認証から戻っています...</p>
        <p className="text-sm text-slate-500">数秒お待ちください。</p>
      </div>
    </div>
  );
};

export default AuthCallback;
