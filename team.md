---
layout: page
title: Зустрічайте Команду
description: Розробка Vite керується міжнародною командою.
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamPageSection,
  VPTeamMembers
} from 'vitepress/theme'
import { core, emeriti } from './_data/team'
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Зустрічайте Команду</template>
    <template #lead>
      Розробка Vite керується міжнародною командою, деякі з яких вирішили бути представленими нижче.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="core" />
  <VPTeamPageSection>
    <template #title>Команда Емеритів</template>
    <template #lead>
      Тут ми вшановуємо деяких колишніх членів команди, які зробили цінний внесок у минулому.
    </template>
    <template #members>
      <VPTeamMembers size="small" :members="emeriti" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>

