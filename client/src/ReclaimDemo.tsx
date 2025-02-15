import { Proof, ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { useState } from 'react';
import QRCode from 'react-qr-code';

const proofX: Proof = {
  identifier: '0x88d1307dd790649dd5aabc6c28a97f959e78292a0055707210e79206e59cfdb6',
  claimData: {
    provider: 'http',
    parameters:
      '{"additionalClientOptions":{},"body":"","geoLocation":"IN","headers":{"Referer":"https://twitter.com/rsl______","Sec-Fetch-Mode":"same-origin","User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1"},"method":"GET","paramValues":{"URL_PARAMS_1":"32pL5BWe9WKeSK1MoPvFQQ","URL_PARAM_2_GRD":"variables=%7B%22screen_name%22%3A%22rsl______%22%7D&features=%7B%22hidden_profile_subscriptions_enabled%22%3Atrue%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22subscriptions_verification_info_is_identity_verified_enabled%22%3Atrue%2C%22subscriptions_verification_info_verified_since_enabled%22%3Atrue%2C%22highlights_tweets_tab_ui_enabled%22%3Atrue%2C%22responsive_web_twitter_article_notes_tab_enabled%22%3Atrue%2C%22subscriptions_feature_can_gift_premium%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%7D&fieldToggles=%7B%22withAuxiliaryUserLabels%22%3Afalse%7D","URL_PARAM_DOMAIN":"twitter","created_at":"Mon Jul 08 08:54:42 +0000 2019","followers_count":"7","screen_name":"rsl______"},"responseMatches":[{"invert":false,"type":"contains","value":"\\"screen_name\\":\\"{{screen_name}}\\""},{"invert":false,"type":"contains","value":"\\"followers_count\\":{{followers_count}}"},{"invert":false,"type":"contains","value":"\\"created_at\\":\\"{{created_at}}\\""}],"responseRedactions":[{"jsonPath":"$.data.user.result.legacy.screen_name","regex":"\\"screen_name\\":\\"(.*)\\"","xPath":""},{"jsonPath":"$.data.user.result.legacy.followers_count","regex":"\\"followers_count\\":(.*)","xPath":""},{"jsonPath":"$.data.user.result.legacy.created_at","regex":"\\"created_at\\":\\"(.*)\\"","xPath":""}],"url":"https://{{URL_PARAM_DOMAIN}}.com/i/api/graphql/{{URL_PARAMS_1}}/UserByScreenName?{{URL_PARAM_2_GRD}}"}',
    owner: '0xd4f3de8ec0b3cbc4cbfde111c966a948197cf069',
    timestampS: 1738680980,
    context:
      '{"contextAddress":"0x0","contextMessage":"sample context","extractedParameters":{"URL_PARAMS_1":"32pL5BWe9WKeSK1MoPvFQQ","URL_PARAM_2_GRD":"variables=%7B%22screen_name%22%3A%22rsl______%22%7D&features=%7B%22hidden_profile_subscriptions_enabled%22%3Atrue%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22subscriptions_verification_info_is_identity_verified_enabled%22%3Atrue%2C%22subscriptions_verification_info_verified_since_enabled%22%3Atrue%2C%22highlights_tweets_tab_ui_enabled%22%3Atrue%2C%22responsive_web_twitter_article_notes_tab_enabled%22%3Atrue%2C%22subscriptions_feature_can_gift_premium%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%7D&fieldToggles=%7B%22withAuxiliaryUserLabels%22%3Afalse%7D","URL_PARAM_DOMAIN":"twitter","created_at":"Mon Jul 08 08:54:42 +0000 2019","followers_count":"7","screen_name":"rsl______"},"providerHash":"0x9cdbbcfbb97a93295d48636bc5255d3d4a06370be5d920bafd4ece8c07d71bc7"}',
    identifier: '0x88d1307dd790649dd5aabc6c28a97f959e78292a0055707210e79206e59cfdb6',
    epoch: 1,
  },
  signatures: [
    '0xf61e1a4b26068890d60b84febc633846080360bb4c90741499a9ded8e1f7cf503e43fd08c187941d0b0584bee7917dc9c547eab0c8c2fdfbf7b91f126c3035e61b',
  ],
  witnesses: [
    {
      id: '0x244897572368eadf65bfbc5aec98d8e5443a9072',
      url: 'wss://attestor.reclaimprotocol.org/ws',
    },
  ],
  publicData: {},
};

const proofGithub = {
  identifier: '0xccb8428e35c498f7a08e096b5078f3cb032ee4eafa943e1301f9cd3bc6d7ff80',
  claimData: {
    provider: 'http',
    parameters:
      '{"additionalClientOptions":{},"body":"","geoLocation":"","headers":{"Referer":"https://github.com/settings/profile","Sec-Fetch-Mode":"same-origin","User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1"},"method":"GET","paramValues":{"username":"RuslanShlinchak"},"responseMatches":[{"invert":false,"type":"contains","value":"<span class=\\"color-fg-muted\\">({{username}})</span>"}],"responseRedactions":[{"jsonPath":"","regex":"<span class=\\"color-fg-muted\\">\\\\((.*)\\\\)</span>","xPath":""}],"url":"https://github.com/settings/profile"}',
    owner: '0xd4f3de8ec0b3cbc4cbfde111c966a948197cf069',
    timestampS: 1738681895,
    context:
      '{"contextAddress":"0x0","contextMessage":"sample context","extractedParameters":{"username":"RuslanShlinchak"},"providerHash":"0xcb4a6b54d59f97b5891cced83e9e909c938bc06149a22f9e76309f2d20300609"}',
    identifier: '0xccb8428e35c498f7a08e096b5078f3cb032ee4eafa943e1301f9cd3bc6d7ff80',
    epoch: 1,
  },
  signatures: [
    '0xf1b2daadbbeb9bc1e7c514c00097328fdb4909d1adba841c1813697c73dcf07158af1708285a71bb8f2bac1c685be13c1a7b3e930dde88795f491187cb9d38741b',
  ],
  witnesses: [
    {
      id: '0x244897572368eadf65bfbc5aec98d8e5443a9072',
      url: 'wss://attestor.reclaimprotocol.org/ws',
    },
  ],
  publicData: null,
};

const proofGoogle = {
  identifier: '0x621464d347764ba64464a925b38d632c98e12fe9c07c4f83cdf8d767491bf7f9',
  claimData: {
    provider: 'http',
    parameters:
      '{"additionalClientOptions":{},"body":"","geoLocation":"","headers":{"Referer":"https://developers.google.com/people?hl=ru","Sec-Fetch-Mode":"same-origin","User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1","x-requested-with":"XMLHttpRequest"},"method":"POST","paramValues":{"email":"\\"RuslanAleksandrovich56@gmail.com\\""},"responseMatches":[{"invert":false,"type":"contains","value":"{{email}}"}],"responseRedactions":[{"jsonPath":"$.2","regex":"(.*)","xPath":""}],"url":"https://developers.google.com/_d/profile/user"}',
    owner: '0xd4f3de8ec0b3cbc4cbfde111c966a948197cf069',
    timestampS: 1738682130,
    context:
      '{"contextAddress":"0x0","contextMessage":"sample context","extractedParameters":{"email":"\\"RuslanAleksandrovich56@gmail.com\\""},"providerHash":"0x11b2084a8fef53a4250bc6f06343cc0805ee1134b740b8521f8cd9365cee0073"}',
    identifier: '0x621464d347764ba64464a925b38d632c98e12fe9c07c4f83cdf8d767491bf7f9',
    epoch: 1,
  },
  signatures: [
    '0x9721345a4cbfec3591d34920debc7ca50f4ee9b0343c368e697534c78a31c1826b6333be9f37fa1e9ced38a2f8a8220f33a3b4dcd898faf5ef04a67e4ce4f54a1b',
  ],
  witnesses: [
    {
      id: '0x244897572368eadf65bfbc5aec98d8e5443a9072',
      url: 'wss://attestor.reclaimprotocol.org/ws',
    },
  ],
  publicData: null,
};

const proofLinkedin = {
  identifier: '0x0fcea76f2b710fd22ab0421d3301d8a83af657f1cab620f6ab7137eb2dd4534e',
  claimData: {
    provider: 'http',
    parameters:
      '{"additionalClientOptions":{},"body":"","geoLocation":"in","headers":{"Referer":"https://www.linkedin.com/dashboard/","Sec-Fetch-Mode":"same-origin","User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1"},"method":"GET","paramValues":{"Username":"ruslan-shlinchak","param1":"&quot"},"responseMatches":[{"invert":false,"type":"contains","value":"publicIdentifier{{param1}};:&quot;{{Username}}&quot;,&quot"}],"responseRedactions":[{"jsonPath":"","regex":"publicIdentifier(.*?);:&quot;(.*?)&quot;,&quot","xPath":""}],"url":"https://www.linkedin.com/dashboard/"}',
    owner: '0xd4f3de8ec0b3cbc4cbfde111c966a948197cf069',
    timestampS: 1738837326,
    context:
      '{"contextAddress":"0x0","contextMessage":"sample context","extractedParameters":{"Username":"ruslan-shlinchak","param1":"&quot"},"providerHash":"0x36b7246bdfd6afd6a159fbc437db9b6a12af57625519b7e59ea5dc62c1c4cd9e"}',
    identifier: '0x0fcea76f2b710fd22ab0421d3301d8a83af657f1cab620f6ab7137eb2dd4534e',
    epoch: 1,
  },
  signatures: [
    '0x89abc1cf8ae394485fcbd25c032e568c21641f9e68c804989b3b1333829f41006c2bebc4fbf199360dade36efe344aef9a3f5c9a48c17a966edf94dca904f4c81c',
  ],
  witnesses: [
    {
      id: '0x244897572368eadf65bfbc5aec98d8e5443a9072',
      url: 'wss://attestor.reclaimprotocol.org/ws',
    },
  ],
  publicData: null,
};

export function ReclaimDemo() {
  // State to store the verification request URL
  const [requestUrl, setRequestUrl] = useState('');
  const [proofs, setProofs] = useState([]);

  const validateProof = async (proofs: Proof | Proof[]) => {
    try {
      const response = await fetch('http://localhost:8080/proof', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof: proofs,
          provider: 'linkedin'
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication token expired or invalid');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Proof registered successfully:', result);
    } catch (error) {
      console.error('Failed to register proof:', error);
    }
  };

  const getVerificationReq = async () => {
    // Your credentials from the Reclaim Developer Portal
    // Replace these with your actual credentials

    const APP_ID = '0xbfB817DdcF51E591A1a9261eaDb57F581BB40c04';
    const APP_SECRET = '0xcbd3a376cca4aaf5abfb98a76f840e414df9b07d96a471f9dac102fb2dd9cddb';
    const PROVIDER_ID = 'a9f1063c-06b7-476a-8410-9ff6e427e637';

    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);

    // Generate the verification request URL
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    console.log('Request URL:', requestUrl);

    setRequestUrl(requestUrl);

    // Start listening for proof submissions
    await reclaimProofRequest.startSession({
      // Called when the user successfully completes the verification
      onSuccess: async (proofs) => {
        // Add your success logic here, such as:
        // - Updating UI to show verification success
        // - Storing verification status
        // - Redirecting to another page
        if (proofs && typeof proofs !== 'string') {
          console.log('Proof received:', proofs?.claimData.context);

          // Send the proof to your backend service for Prism integration
          validateProof(proofs);

          console.log('Verification success', proofs);
          setProofs(proofs as any);
        } else {
          console.error('Invalid proof:', proofs);
        }
      },
      // Called if there's an error during verification
      onError: (error) => {
        console.error('Verification failed', error);

        // Add your error handling logic here, such as:
        // - Showing error message to user
        // - Resetting verification state
        // - Offering retry options
      },
    });
  };

  return (
    <>
      <button onClick={getVerificationReq}>Get Verification Request</button>
      <button onClick={() => validateProof(proofLinkedin)}>Validate proof</button>

      {/* Display QR code when URL is available */}

      {requestUrl && (
        <div style={{ margin: '20px 0' }}>
          <QRCode value={requestUrl} />
        </div>
      )}

      {proofs && (
        <div>
          <h2>Verification Successful!</h2>
          <pre>{JSON.stringify(proofs, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
