import { IconType } from 'react-icons';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaSquareXTwitter } from "react-icons/fa6";
import { FcGoogle } from 'react-icons/fc';

const providerIcons: Record<string, IconType> = {
  'twitter': FaSquareXTwitter,
  'google': FcGoogle,
  'linkedin': FaLinkedin,
  'github': FaGithub,
};

export const getProviderIcon = (providerId: string): IconType => {
  return providerIcons[providerId.toLowerCase()] || FaGithub; // FaGithub as default icon
};
