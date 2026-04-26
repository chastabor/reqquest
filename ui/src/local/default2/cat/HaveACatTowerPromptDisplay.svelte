<script lang="ts">
  export let data: any
</script>

{#if data.haveCatTower}Already owns a cat tower.
{:else if data.willPurchaseCatTower}Will purchase a cat tower.
{:else if data.haveCatTower === false}No cat tower.
{/if}
