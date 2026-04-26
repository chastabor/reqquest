<script lang="ts">
  export let data: any
</script>

{#if data.allow}Applicant is allowed to continue.
{:else if data.allow === false}Applicant is NOT allowed to continue.
{:else}
{/if}
