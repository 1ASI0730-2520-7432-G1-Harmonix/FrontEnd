/**
 * Assembler Pattern Implementation for Member Management
 * Composes complex operations from simple, reusable components
 */

import httpInstance from '@/shared/services/http.instance';

class MemberDataFetcher {
  async fetchHouseholdMembers(householdId) {
    return await httpInstance.get(`/household_member/household/${householdId}`);
  }
}

class MemberDataProcessor {
  mapMember(member) {
    return {
      ...member
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

    const householdMembersResponse = await this.fetcher.fetchHouseholdMembers(userData.householdId);
    const householdMembers = householdMembersResponse.data || [];

    return householdMembers.map(member => this.processor.mapMember(member));
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
