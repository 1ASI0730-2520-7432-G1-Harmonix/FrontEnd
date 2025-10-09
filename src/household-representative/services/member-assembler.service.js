/**
 * Assembler Pattern Implementation for Member Management
 * Composes complex operations from simple, reusable components
 */

import httpInstance from '@/shared/services/http.instance';

class MemberDataFetcher {
  async fetchUsers(householdId) {
    return await httpInstance.get(`/users?householdId=${householdId}`);
  }
  
  async fetchContributions() {
    return await httpInstance.get('/memberContributions');
  }
  
  async fetchHouseholdMembers(householdId) {
    return await httpInstance.get(`/householdMember?householdId=${householdId}`);
  }
}

class MemberDataProcessor {
  calculateTotalContributions(memberId, contributions) {
    return contributions
      .filter(c => c.memberId === memberId)
      .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  }
  
  mapUserToMember(user, householdMember, totalContributed) {
    return {
      ...user,
      householdMemberId: householdMember?.id,
      totalContributed: totalContributed.toFixed(2)
    };
  }
}

class MemberDataValidator {
  validateHouseholdData(userData) {
    if (!userData || !userData.householdId) {
      throw new Error('Household information not found');
    }
    return true;
  }
}

class MemberAssembler {
  constructor() {
    this.fetcher = new MemberDataFetcher();
    this.processor = new MemberDataProcessor();
    this.validator = new MemberDataValidator();
  }
  
  async assembleHouseholdMembers() {
    const userData = JSON.parse(localStorage.getItem('user'));
    this.validator.validateHouseholdData(userData);

    const [usersResponse, contributionsResponse, householdMembersResponse] = await Promise.all([
      this.fetcher.fetchUsers(userData.householdId),
      this.fetcher.fetchContributions(),
      this.fetcher.fetchHouseholdMembers(userData.householdId)
    ]);

    const users = usersResponse.data;
    const allContributions = contributionsResponse.data;
    const householdMembers = householdMembersResponse.data;
    const memberUsers = users.filter(user => user.role === 'member');
    
    return memberUsers.map(user => {
      const householdMember = householdMembers.find(hm => hm.userId === user.id);
      const totalContributed = this.processor.calculateTotalContributions(
        householdMember?.id, 
        allContributions
      );
      
      return this.processor.mapUserToMember(user, householdMember, totalContributed);
    });
  }
}

class MemberFilterProcessor {
  applyFilters(members, filters) {
    return members.filter(member => {
      const matchesSearch = !filters.searchTerm || 
        member.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = !filters.statusFilter || 
        member.status === filters.statusFilter;
      
      const matchesRole = !filters.roleFilter || 
        member.role === filters.roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }
}

class MemberPipeline {
  constructor() {
    this.assembler = new MemberAssembler();
    this.filterProcessor = new MemberFilterProcessor();
  }
  
  async processMemberData(filters = null) {
    try {
      const members = await this.assembler.assembleHouseholdMembers();

      if (filters) {
        return this.filterProcessor.applyFilters(members, filters);
      }
      
      return members;
    } catch (error) {
      console.error('Pipeline processing error:', error);
      throw error;
    }
  }
}

export default new MemberPipeline();
