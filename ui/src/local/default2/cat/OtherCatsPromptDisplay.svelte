<script lang="ts">
  import YesNoFollowUpDisplay from "../_templates/YesNoFollowUpDisplay.svelte"
  export let data: any
</script>

<YesNoFollowUpDisplay {data} path="hasOtherCats" label="Has other cats in household" />
