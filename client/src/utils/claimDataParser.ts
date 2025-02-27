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

/**
 * Parses the claim_data_params string based on the provider_id
 * @param providerId ID of the provider
 * @param claimDataParams String with parameters
 * @returns Object with parsed data
 */
export function parseClaimData(providerId: string, claimDataParams: string): ParsedClaimData {
  try {
    const provider = PROVIDERS.find(p => p.providerId === providerId);

    if (!provider) {
      console.warn(`Unknown provider ID: ${providerId}`);
      return { displayValue: 'Unknown' };
    }

    let parsedData: ProviderData;
    try {
      parsedData = JSON.parse(claimDataParams);

      if (typeof parsedData === 'object' && parsedData !== null) {
        for (const key in parsedData) {
          if (typeof parsedData[key] === 'string' &&
            (parsedData[key] as string).trim().startsWith('{') &&
            (parsedData[key] as string).trim().endsWith('}')) {
            try {
              parsedData[key] = JSON.parse(parsedData[key] as string);
            } catch {
              // do nothing
            }
          }
        }
      }
    } catch {
      console.warn(`Failed to parse claim_data_params as JSON: ${claimDataParams}`);
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

function parseTwitterData(data: ProviderData): ParsedClaimData {
  try {
    if (data.paramValues) {
      const paramValues = data.paramValues as ProviderData;
      const username = (paramValues.screen_name as string) || '';
      const followersCount = paramValues.followers_count ? String(paramValues.followers_count) : '';
      const createdAt = paramValues.created_at ? String(paramValues.created_at) : '';

      console.log('paramValues', paramValues);

      return {
        username,
        fullName: '',
        profileUrl: username ? `https://twitter.com/${username}` : '',
        displayValue: username ? `@${username}${followersCount ? ` · ${followersCount} followers` : ''}` : 'Twitter User',
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
  const username = (data.vanity_name as string) || (data.id as string) || '';
  return {
    username,
    fullName: (data.name as string) || '',
    profileUrl: username ? `https://linkedin.com/in/${username}` : '',
    displayValue: (data.name as string) || username || 'LinkedIn User',
  };
}

function parseGithubData(data: ProviderData): ParsedClaimData {
  const username = (data.login as string) || '';
  return {
    username,
    fullName: (data.name as string) || '',
    profileUrl: username ? `https://github.com/${username}` : '',
    avatarUrl: (data.avatar_url as string) || '',
    displayValue: username || 'GitHub User',
  };
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
