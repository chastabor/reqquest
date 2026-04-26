<script lang="ts">
  import LabeledFields from "../_templates/LabeledFields.svelte"
  export let data: any
</script>

{#if !data.haveYard}No yard.
{:else}<LabeledFields {data} entries={[{ path: "squareFootage", label: "Square Footage" }, { path: "totalPets", label: "Total Pets" }]} />
{/if}
