import { create } from 'zustand';
import { api, HouseholdInfo, MemberSummary } from '@/lib/api';

interface HouseholdState {
  household: HouseholdInfo | null;
  members: MemberSummary[];
  loaded: boolean;
  fetchHousehold: (force?: boolean) => Promise<void>;
  fetchMembers: (force?: boolean) => Promise<MemberSummary[]>;
  invalidate: () => void;
}

let householdPromise: Promise<void> | null = null;
let membersPromise: Promise<MemberSummary[]> | null = null;

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  household: null,
  members: [],
  loaded: false,

  fetchHousehold: async (force = false) => {
    if (!force && get().loaded) return;
    if (!force && householdPromise) return householdPromise;

    householdPromise = api
      .getHousehold()
      .then((res) => {
        set({ household: res.data, loaded: true });
      })
      .catch(() => {
        set({ household: null, loaded: true });
      })
      .finally(() => {
        householdPromise = null;
      });

    return householdPromise;
  },

  fetchMembers: async (force = false) => {
    const { members, household } = get();
    if (!force && members.length > 0) return members;
    if (!household && !force) {
      await get().fetchHousehold();
      if (!get().household) return [];
    }
    if (!force && membersPromise) return membersPromise;

    membersPromise = api
      .getHouseholdDashboard()
      .then((res) => {
        const list = res.data.members || [];
        set({ members: list });
        return list;
      })
      .catch(() => [] as MemberSummary[])
      .finally(() => {
        membersPromise = null;
      });

    return membersPromise;
  },

  invalidate: () => {
    householdPromise = null;
    membersPromise = null;
    set({ household: null, members: [], loaded: false });
  },
}));

export const useHasHousehold = () => useHouseholdStore((s) => !!s.household);
