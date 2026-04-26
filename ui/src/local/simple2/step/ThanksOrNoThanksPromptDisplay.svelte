<script lang="ts">
  export let data: any
</script>

{#if data.thanks}Applicant is interested in this program.
{:else if data.thanks === false}Applicant is NOT interested in this program.
{:else}
{/if}
