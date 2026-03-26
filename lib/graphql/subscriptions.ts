import { gql } from "graphql-tag";

/**
 * GraphQL Subscription Documents for real-time bounty events.
 */

export const BOUNTY_CREATED_SUBSCRIPTION = gql`
  subscription BountyCreated {
    bountyCreated {
      id
      title
      status
      rewardAmount
      rewardCurrency
    }
  }
`;

export const ON_BOUNTY_UPDATED_SUBSCRIPTION = gql`
  subscription OnBountyUpdated {
    bountyUpdated {
      id
      title
      status
      rewardAmount
      rewardCurrency
      updatedAt
    }
  }
`;

export const BOUNTY_UPDATED_SUBSCRIPTION = ON_BOUNTY_UPDATED_SUBSCRIPTION;

export const ON_NEW_APPLICATION_SUBSCRIPTION = gql`
  subscription OnNewApplication {
    submissionCreated {
      id
      bountyId
      submittedBy
      status
      createdAt
      submittedByUser {
        id
        name
        image
      }
    }
  }
`;

export const BOUNTY_DELETED_SUBSCRIPTION = gql`
  subscription BountyDeleted {
    bountyDeleted {
      id
    }
  }
`;

/**
 * Type definitions for subscription response data.
 * These ensure strict typing throughout the sync layer.
 */

export interface BountyCreatedData {
  bountyCreated: {
    id: string;
    title: string;
    status: string;
    rewardAmount: number;
    rewardCurrency: string;
  };
}

export interface BountyUpdatedData {
  bountyUpdated: {
    id: string;
    title: string;
    status: string;
    rewardAmount: number;
    rewardCurrency: string;
    updatedAt?: string | null;
  };
}

export interface OnBountyUpdatedData {
  bountyUpdated: {
    id: string;
    title: string;
    status: string;
    rewardAmount: number;
    rewardCurrency: string;
    updatedAt?: string | null;
  };
}

export interface OnNewApplicationData {
  submissionCreated: {
    id: string;
    bountyId: string;
    submittedBy: string;
    status: string;
    createdAt: string;
    submittedByUser?: {
      id: string;
      name?: string | null;
      image?: string | null;
    } | null;
  };
}

export interface BountyDeletedData {
  bountyDeleted: {
    id: string;
  };
}
