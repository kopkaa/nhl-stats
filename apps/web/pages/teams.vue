<script setup lang="ts">
import gql from 'graphql-tag';
import { useQuery } from '@vue/apollo-composable';

const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
      fullName
      triCode
      logo
    }
  }
`;

const { result, loading, error } = useQuery(GET_TEAMS);

const teams = computed(() => result.value?.teams ?? []);
</script>

<template>
  <div class="teams-page">
    <h1>NHL Teams</h1>

    <p v-if="loading" class="status">Loading...</p>
    <p v-else-if="error" class="status error">{{ error.message }}</p>

    <div v-else class="teams-grid">
      <div v-for="team in teams" :key="team.id" class="team-card">
        <img
          v-if="team.logo"
          :src="team.logo"
          :alt="team.fullName"
          class="team-logo"
        />
        <div class="team-info">
          <span class="team-name">{{ team.fullName }}</span>
          <span class="team-code">{{ team.triCode }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.teams-page h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.status {
  color: #888;
  text-align: center;
  padding: 2rem;
}

.status.error {
  color: #e53935;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.team-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: border-color 0.2s;
}

.team-card:hover {
  border-color: #444;
}

.team-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.team-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.team-name {
  font-weight: 600;
  font-size: 0.95rem;
  text-align: center;
}

.team-code {
  color: #666;
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
