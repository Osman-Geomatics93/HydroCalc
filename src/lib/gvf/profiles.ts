import type { ProfileType } from '../../types';
import type { SlopeClass } from '../friction/classification';

export interface ProfileInfo {
  type: ProfileType;
  slopeClass: SlopeClass;
  zone: number;
  description: string;
  depthRelation: string;
  behavior: string;
}

const PROFILE_INFO: Record<ProfileType, Omit<ProfileInfo, 'type'>> = {
  M1: { slopeClass: 'Mild', zone: 1, description: 'Backwater curve', depthRelation: 'y > yn > yc', behavior: 'Depth increases downstream, approaches horizontal asymptote' },
  M2: { slopeClass: 'Mild', zone: 2, description: 'Drawdown curve', depthRelation: 'yn > y > yc', behavior: 'Depth decreases downstream, approaches yc at downstream end' },
  M3: { slopeClass: 'Mild', zone: 3, description: 'Backwater curve', depthRelation: 'yn > yc > y', behavior: 'Depth increases downstream, ends in hydraulic jump' },
  S1: { slopeClass: 'Steep', zone: 1, description: 'Backwater curve', depthRelation: 'y > yc > yn', behavior: 'Depth increases downstream, approaches horizontal asymptote' },
  S2: { slopeClass: 'Steep', zone: 2, description: 'Drawdown curve', depthRelation: 'yc > y > yn', behavior: 'Depth decreases downstream, approaches yn' },
  S3: { slopeClass: 'Steep', zone: 3, description: 'Backwater curve', depthRelation: 'yc > yn > y', behavior: 'Depth increases downstream, approaches yn asymptotically' },
  C1: { slopeClass: 'Critical', zone: 1, description: 'Backwater curve', depthRelation: 'y > yn = yc', behavior: 'Depth increases downstream' },
  C3: { slopeClass: 'Critical', zone: 3, description: 'Backwater curve', depthRelation: 'y < yn = yc', behavior: 'Depth increases downstream' },
  H2: { slopeClass: 'Horizontal', zone: 2, description: 'Drawdown curve', depthRelation: 'y > yc (S₀=0)', behavior: 'Depth decreases downstream' },
  H3: { slopeClass: 'Horizontal', zone: 3, description: 'Backwater curve', depthRelation: 'y < yc (S₀=0)', behavior: 'Depth increases downstream' },
  A2: { slopeClass: 'Adverse', zone: 2, description: 'Drawdown curve', depthRelation: 'y > yc (S₀<0)', behavior: 'Depth decreases downstream' },
  A3: { slopeClass: 'Adverse', zone: 3, description: 'Backwater curve', depthRelation: 'y < yc (S₀<0)', behavior: 'Depth increases downstream' },
};

export function getProfileInfo(type: ProfileType): ProfileInfo {
  return { type, ...PROFILE_INFO[type] };
}

export function getAllProfiles(): ProfileInfo[] {
  return (Object.keys(PROFILE_INFO) as ProfileType[]).map((type) => ({
    type,
    ...PROFILE_INFO[type],
  }));
}

export function determineProfile(
  slopeClass: SlopeClass,
  y: number,
  yn: number,
  yc: number
): ProfileType | null {
  switch (slopeClass) {
    case 'Mild':
      if (y > yn) return 'M1';
      if (y > yc) return 'M2';
      return 'M3';
    case 'Steep':
      if (y > yc) return 'S1';
      if (y > yn) return 'S2';
      return 'S3';
    case 'Critical':
      if (y > yc) return 'C1';
      return 'C3';
    case 'Horizontal':
      if (y > yc) return 'H2';
      return 'H3';
    case 'Adverse':
      if (y > yc) return 'A2';
      return 'A3';
    default:
      return null;
  }
}
