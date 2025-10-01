// src/services/user.service.ts
import { PrismaClient, UserRole, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  licenseNumber?: string;
  specialization?: string;
  phone?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: UserRole;
  licenseNumber?: string;
  specialization?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export class UserService {
  /**
   * Get all users with optional filters
   */
  async getUsers(filters?: UserFilters) {
    try {
      const where: any = {};

      if (filters?.role) {
        where.role = filters.role;
      }

      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { licenseNumber: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          licenseNumber: true,
          specialization: true,
          phone: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          image: true,
          _count: {
            select: {
              appointments: true,
              treatments: true,
              patientsCreated: true
            }
          }
        },
        orderBy: [
          { isActive: 'desc' },
          { name: 'asc' }
        ]
      });

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Get a single user by ID
   */
  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          licenseNumber: true,
          specialization: true,
          phone: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          image: true,
          _count: {
            select: {
              appointments: true,
              treatments: true,
              patientsCreated: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserData) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password if provided
      let hashedPassword = null;
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 12);
      }

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role,
          licenseNumber: data.licenseNumber,
          specialization: data.specialization,
          phone: data.phone,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          licenseNumber: true,
          specialization: true,
          phone: true,
          isActive: true,
          createdAt: true
        }
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update a user
   */
  async updateUser(id: string, data: UpdateUserData) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Check email uniqueness if updating email
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: data.email }
        });

        if (emailExists) {
          throw new Error('Email already in use');
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email: data.email,
          name: data.name,
          role: data.role,
          licenseNumber: data.licenseNumber,
          specialization: data.specialization,
          phone: data.phone,
          isActive: data.isActive
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          licenseNumber: true,
          specialization: true,
          phone: true,
          isActive: true,
          updatedAt: true
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Deactivate a user (soft delete)
   */
  async deactivateUser(id: string) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          _count: {
            select: {
              appointments: {
                where: {
                  appointmentDate: {
                    gte: new Date()
                  },
                  status: {
                    in: ['SCHEDULED', 'CONFIRMED']
                  }
                }
              }
            }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check for future appointments
      if (user._count.appointments > 0) {
        throw new Error('Cannot deactivate user with future appointments. Please reassign or cancel appointments first.');
      }

      const deactivatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true
        }
      });

      return deactivatedUser;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  /**
   * Reactivate a user
   */
  async reactivateUser(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true
        }
      });

      return user;
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw new Error('Failed to reactivate user');
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(id: string, newPassword: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const user = await prisma.user.update({
        where: { id },
        data: { 
          password: hashedPassword,
          // Clear any existing sessions to force re-login
          sessions: {
            deleteMany: {}
          }
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      return user;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    }
  }

  /**
   * Generate a temporary password
   */
  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  }

  /**
   * Check if user can be deleted
   */
  async canDeleteUser(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          _count: {
            select: {
              appointments: true,
              treatments: true,
              patientsCreated: true,
              receiptsIssued: true
            }
          }
        }
      });

      if (!user) {
        return { canDelete: false, reason: 'User not found' };
      }

      // Check if user has any associated data
      const hasData = Object.values(user._count).some(count => count > 0);

      if (hasData) {
        return { 
          canDelete: false, 
          reason: 'User has associated data. Please deactivate instead of deleting.' 
        };
      }

      return { canDelete: true };
    } catch (error) {
      console.error('Error checking user deletion:', error);
      return { canDelete: false, reason: 'Error checking user data' };
    }
  }

  /**
   * Delete a user (hard delete - use with caution)
   */
  async deleteUser(id: string) {
    try {
      const canDelete = await this.canDeleteUser(id);
      
      if (!canDelete.canDelete) {
        throw new Error(canDelete.reason);
      }

      await prisma.user.delete({
        where: { id }
      });

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics() {
    try {
      const [totalUsers, activeUsers, roleDistribution] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.groupBy({
          by: ['role'],
          _count: true
        })
      ]);

      return {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: roleDistribution.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<UserRole, number>)
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }
}

// Export singleton instance
export const userService = new UserService();

export default userService;