import { PROVIDERS } from '@/config';

export interface ParsedClaimData {
  username?: string;
  email?: string;
  fullName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  displayValue: string;
  createdAt?: string;
  followersCount?: string;
  buttonText?: string;
}

interface ProviderData {
  [key: string]: unknown;
}

interface ResponseRedaction {
  regex?: string;
  jsonPath?: string;
  xPath?: string;
}

interface ResponseMatch {
  invert?: boolean;
  type?: string;
  value?: string;
}

/**
 * Parses the claim_data_params string based on the provider_id
 * @param providerId ID of the provider
 * @param claimDataParams String with parameters
 * @returns Object with parsed data
 */
export function parseClaimData(providerId: string, claimDataParams: string): ParsedClaimData {
  try {
    const provider = PROVIDERS.find((p) => p.providerId === providerId);

    if (!provider) {
      console.warn(`Unknown provider ID: ${providerId}`);
      return { displayValue: 'Unknown' };
    }

    let parsedData: ProviderData;
    try {
      parsedData = JSON.parse(claimDataParams);

      if (typeof parsedData === 'object' && parsedData !== null) {
        parsedData = parseNestedObjects(parsedData);
      }
    } catch (error) {
      console.warn(`Failed to parse claim_data_params as JSON: ${claimDataParams}`, error);
      return { displayValue: 'Invalid data' };
    }

    switch (provider.id) {
      case 'twitter':
        return parseTwitterData(parsedData);
      case 'google':
        return parseGoogleData(parsedData);
      case 'linkedin':
        return parseLinkedinData(parsedData);
      case 'github':
        return parseGithubData(parsedData);
      case 'facebook':
        return parseFacebookData(parsedData);
      case 'binance':
        return parseBinanceData(parsedData);
      case 'coinbase':
        return parseCoinbaseData(parsedData);
      case 'instagram':
        return parseInstagramData(parsedData);
      default:
        return { displayValue: 'Unknown provider' };
    }
  } catch (error) {
    console.error('Error parsing claim data:', error);
    return { displayValue: 'Error' };
  }
}

/**
 * Recursively processes nested objects, trying to parse JSON strings
 * @param obj Object to process
 * @returns Processed object
 */
function parseNestedObjects(obj: ProviderData): ProviderData {
  const result: ProviderData = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'string') {
      if (value.trim().startsWith('{') && value.trim().endsWith('}')) {
        try {
          result[key] = parseNestedObjects(JSON.parse(value));
        } catch {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        result[key] = value.map(item =>
          typeof item === 'object' && item !== null ? parseNestedObjects(item as ProviderData) : item
        );
      } else {
        result[key] = parseNestedObjects(value as ProviderData);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

function parseTwitterData(data: ProviderData): ParsedClaimData {
  try {
    if (data.paramValues) {
      const paramValues = data.paramValues as ProviderData;
      const username = (paramValues.screen_name as string) || '';
      const followersCount = paramValues.followers_count ? String(paramValues.followers_count) : '';
      const createdAt = paramValues.created_at ? String(paramValues.created_at) : '';

      return {
        username,
        fullName: '',
        profileUrl: username ? `https://twitter.com/${username}` : '',
        displayValue: username
          ? `@${username}${followersCount ? ` · ${followersCount} followers` : ''}`
          : 'Twitter User',
        createdAt: createdAt,
        followersCount: followersCount,
        buttonText: username,
      };
    }

    const username = (data.username as string) || (data.screen_name as string) || '';
    return {
      username,
      fullName: (data.name as string) || '',
      profileUrl: username ? `https://twitter.com/${username}` : '',
      avatarUrl: (data.profile_image_url as string) || '',
      displayValue: username ? `@${username}` : 'Twitter User',
    };
  } catch (error) {
    console.error('Error parsing Twitter data:', error);
    return { displayValue: 'Twitter User' };
  }
}

function parseGoogleData(data: ProviderData): ParsedClaimData {
  try {
    if (data.paramValues) {
      const paramValues = data.paramValues as ProviderData;
      let email = '';

      if (paramValues.email) {
        email = String(paramValues.email).replace(/^"|"$/g, '');
      }

      return {
        email,
        fullName: '',
        displayValue: email || 'Google User',
        buttonText: email,
      };
    }

    return {
      email: (data.email as string) || '',
      fullName: (data.name as string) || '',
      avatarUrl: (data.picture as string) || '',
      displayValue: (data.email as string) || 'Google User',
    };
  } catch (error) {
    console.error('Error parsing Google data:', error);
    return { displayValue: 'Google User' };
  }
}

function parseLinkedinData(data: ProviderData): ParsedClaimData {
  try {
    if (data.paramValues) {
      const paramValues = data.paramValues as ProviderData;
      let username = (paramValues.Username as string) || '';

      if (username) {
        username = username.replace(/^["']|["']$/g, '');
      }

      let extractedUsername = '';
      if (data.responseRedactions && Array.isArray(data.responseRedactions)) {
        for (const redaction of data.responseRedactions) {
          if (typeof redaction === 'object' && redaction !== null) {
            const typedRedaction = redaction as ResponseRedaction;
            if (typedRedaction.regex && typedRedaction.regex.includes('publicIdentifier')) {
              extractedUsername = username;
              break;
            }
          }
        }
      }

      if (!extractedUsername && data.responseMatches && Array.isArray(data.responseMatches)) {
        for (const match of data.responseMatches) {
          if (typeof match === 'object' && match !== null) {
            const typedMatch = match as ResponseMatch;
            if (typedMatch.value && typedMatch.value.includes('{{Username}}')) {
              extractedUsername = username;
              break;
            }
          }
        }
      }

      if (!extractedUsername && data.url) {
        const url = data.url as string;
        if (url.includes('linkedin.com/in/')) {
          const matches = url.match(/linkedin\.com\/in\/([^/?&#]+)/);
          if (matches && matches[1]) {
            extractedUsername = matches[1];
          }
        }
      }

      if (!extractedUsername && data.body) {
        const body = data.body as string;
        if (body.includes('vanityName') || body.includes('publicIdentifier')) {
          const matches = body.match(/vanityName=([^&]+)|publicIdentifier=([^&]+)/);
          if (matches && (matches[1] || matches[2])) {
            extractedUsername = matches[1] || matches[2] || '';
          }
        }
      }

      if (!extractedUsername && data.headers) {
        const headers = data.headers as Record<string, string>;
        if (headers.Referer && headers.Referer.includes('linkedin.com/in/')) {
          const matches = headers.Referer.match(/linkedin\.com\/in\/([^/?&#]+)/);
          if (matches && matches[1]) {
            extractedUsername = matches[1];
          }
        }
      }

      if (extractedUsername) {
        extractedUsername = extractedUsername.replace(/^["']|["']$/g, '');
        extractedUsername = decodeURIComponent(extractedUsername);
      }

      const finalUsername = extractedUsername || username;

      return {
        username: finalUsername,
        fullName: '',
        profileUrl: finalUsername ? `https://linkedin.com/in/${finalUsername}` : '',
        displayValue: finalUsername || 'LinkedIn User',
        buttonText: finalUsername,
      };
    }

    const username = (data.vanity_name as string) || (data.id as string) || '';
    return {
      username,
      fullName: (data.name as string) || '',
      profileUrl: username ? `https://linkedin.com/in/${username}` : '',
      displayValue: (data.name as string) || username || 'LinkedIn User',
    };
  } catch (error) {
    console.error('Error parsing LinkedIn data:', error);
    return { displayValue: 'LinkedIn User' };
  }
}

function parseGithubData(data: ProviderData): ParsedClaimData {
  try {
    if (data.paramValues) {
      const paramValues = data.paramValues as ProviderData;
      const username = (paramValues.username as string) || '';

      return {
        username,
        fullName: '',
        profileUrl: username ? `https://github.com/${username}` : '',
        displayValue: username || 'GitHub User',
        buttonText: username,
      };
    }

    const username = (data.login as string) || '';
    return {
      username,
      fullName: (data.name as string) || '',
      profileUrl: username ? `https://github.com/${username}` : '',
      avatarUrl: (data.avatar_url as string) || '',
      displayValue: username || 'GitHub User',
    };
  } catch (error) {
    console.error('Error parsing GitHub data:', error);
    return { displayValue: 'GitHub User' };
  }
}

function parseFacebookData(data: ProviderData): ParsedClaimData {
  return {
    username: (data.username as string) || '',
    fullName: (data.name as string) || '',
    profileUrl: data.id ? `https://facebook.com/${data.id}` : '',
    displayValue: (data.name as string) || (data.username as string) || 'Facebook User',
  };
}

function parseBinanceData(data: ProviderData): ParsedClaimData {
  return {
    username: (data.user_id as string) || '',
    fullName: (data.name as string) || '',
    displayValue: (data.name as string) || (data.user_id as string) || 'Binance User',
  };
}

function parseCoinbaseData(data: ProviderData): ParsedClaimData {
  return {
    username: (data.user_id as string) || '',
    email: (data.email as string) || '',
    displayValue: (data.email as string) || (data.user_id as string) || 'Coinbase User',
  };
}

function parseInstagramData(data: ProviderData): ParsedClaimData {
  const username = (data.username as string) || '';
  return {
    username,
    fullName: (data.full_name as string) || '',
    profileUrl: username ? `https://instagram.com/${username}` : '',
    avatarUrl: (data.profile_picture as string) || '',
    displayValue: username ? `@${username}` : 'Instagram User',
  };
}
