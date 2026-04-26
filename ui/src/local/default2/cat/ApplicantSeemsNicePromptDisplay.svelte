<script lang="ts">
  import YesNoFollowUpDisplay from "../_templates/YesNoFollowUpDisplay.svelte"
  export let data: any
</script>

<YesNoFollowUpDisplay {data} path="seemsNice" label="Applicant seems nice" yesText="Nice" noText="Mean" />
