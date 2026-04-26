<script lang="ts">
  import YesNoFollowUpDisplay from "../_templates/YesNoFollowUpDisplay.svelte"
  export let data: any
</script>

<YesNoFollowUpDisplay {data} path="allergicToTuna" label="Allergic to airborne tuna" />
