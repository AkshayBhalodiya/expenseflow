import Household from '../models/Household.js';
import User from '../models/User.js';
import {
  getUserHousehold,
  getHouseholdDashboard,
  getHouseholdExpenses,
  getHouseholdIncome,
  getHouseholdCreditCards,
  getHouseholdEmis,
  getMembersWithDetails,
} from '../services/householdService.js';
import { logActivity } from '../utils/helpers.js';

export async function getMyHousehold(req, res, next) {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      return res.json({ success: true, data: null });
    }
    const members = await getMembersWithDetails(household);
    res.json({
      success: true,
      data: {
        _id: household._id,
        name: household.name,
        inviteCode: household.inviteCode,
        ownerId: household.ownerId,
        members,
        isOwner: household.ownerId.toString() === req.user._id.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createHousehold(req, res, next) {
  try {
    const existing = await getUserHousehold(req.user._id);
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already in a household' });
    }

    const { name } = req.body;
    const household = await Household.create({
      name: name || 'Our Home',
      ownerId: req.user._id,
      members: [{ userId: req.user._id, role: 'owner' }],
    });

    await User.findByIdAndUpdate(req.user._id, { householdId: household._id });
    await logActivity(req.user._id, 'create', 'Household', household._id, {}, req.ip);

    res.status(201).json({
      success: true,
      data: {
        _id: household._id,
        name: household.name,
        inviteCode: household.inviteCode,
        members: [{ userId: req.user._id, role: 'owner', name: req.user.name }],
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function joinHousehold(req, res, next) {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ success: false, message: 'Invite code required' });
    }

    const existing = await getUserHousehold(req.user._id);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Leave current household first' });
    }

    const household = await Household.findOne({ inviteCode: inviteCode.toUpperCase().trim() });
    if (!household) {
      return res.status(404).json({ success: false, message: 'Invalid invite code' });
    }

    if (household.members.some((m) => m.userId.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    household.members.push({ userId: req.user._id, role: 'member' });
    await household.save();
    await User.findByIdAndUpdate(req.user._id, { householdId: household._id });

    await logActivity(req.user._id, 'join', 'Household', household._id, {}, req.ip);
    res.json({ success: true, message: `Joined ${household.name}`, data: { name: household.name } });
  } catch (error) {
    next(error);
  }
}

export async function leaveHousehold(req, res, next) {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      return res.status(404).json({ success: false, message: 'Not in a household' });
    }

    const isOwner = household.ownerId.toString() === req.user._id.toString();

    if (isOwner && household.members.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Transfer ownership or remove members before leaving as owner',
      });
    }

    household.members = household.members.filter(
      (m) => m.userId.toString() !== req.user._id.toString()
    );

    if (household.members.length === 0) {
      await household.deleteOne();
    } else {
      await household.save();
    }

    await User.findByIdAndUpdate(req.user._id, { householdId: null });
    res.json({ success: true, message: 'Left household' });
  } catch (error) {
    next(error);
  }
}

export async function updateHousehold(req, res, next) {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) return res.status(404).json({ success: false, message: 'No household found' });
    if (household.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only owner can update' });
    }

    if (req.body.name) household.name = req.body.name;
    await household.save();
    res.json({ success: true, data: household });
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req, res, next) {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) return res.status(404).json({ success: false, message: 'No household' });
    if (household.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only owner can remove members' });
    }

    const memberId = req.params.memberId;
    if (memberId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove yourself' });
    }

    household.members = household.members.filter((m) => m.userId.toString() !== memberId);
    await household.save();
    await User.findByIdAndUpdate(memberId, { householdId: null });

    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    next(error);
  }
}

export async function getDashboard(req, res, next) {
  try {
    const data = await getHouseholdDashboard(req.user._id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Join or create a household first' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getExpenses(req, res, next) {
  try {
    const expenses = await getHouseholdExpenses(req.user._id);
    res.json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
}

export async function getIncome(req, res, next) {
  try {
    const income = await getHouseholdIncome(req.user._id);
    res.json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
}

export async function getCreditCards(req, res, next) {
  try {
    const cards = await getHouseholdCreditCards(req.user._id);
    res.json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
}

export async function getEmis(req, res, next) {
  try {
    const emis = await getHouseholdEmis(req.user._id);
    res.json({ success: true, data: emis });
  } catch (error) {
    next(error);
  }
}
