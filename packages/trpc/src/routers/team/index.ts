/**
 * TRPC Router for team management
 *
 * This router provides endpoints for creating and managing teams, handling team members,
 * and managing team invites.
 */

import { acceptInvite } from './handlers/accept-invite'
import { addUser } from './handlers/add-user'
import { create } from './handlers/create'
import { createInvite } from './handlers/create-invite'
// Import all handlers
import { createRouter } from '../../trpc'
import { deleteInvite } from './handlers/delete-invite'
import { deleteTeam } from './handlers/delete'
import { getAll } from './handlers/get-all'
import { getById } from './handlers/get-by-id'
import { getDefaultTeam } from './handlers/get-default-team'
import { getInvites } from './handlers/get-invites'
import { getMembers } from './handlers/get-members'
import { getMembersWithTeams } from './handlers/get-members-with-teams'
import { removeUser } from './handlers/remove-user'
import { update } from './handlers/update'
import { updateUserRole } from './handlers/update-user-role'

export const teamRouter = createRouter({
  acceptInvite,
  addUser,
  create,
  createInvite,
  delete: deleteTeam, // Rename to avoid JavaScript reserved word
  deleteInvite,
  getAll,
  getById,
  getDefaultTeam,
  getInvites,
  getMembers,
  getMembersWithTeams,
  removeUser,
  update,
  updateUserRole,
})
