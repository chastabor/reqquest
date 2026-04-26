<script lang="ts">
  import SatisfactoryReviewSet from "../_templates/SatisfactoryReviewSet.svelte"
  export let data: any
</script>

<SatisfactoryReviewSet {data} items={[{ path: "distemper", label: "Is the proof of distemper vaccination satisfactory?" }, { path: "rabies", label: "Is the proof of rabies vaccination satisfactory?" }, { path: "felineLeukemia", label: "Is the proof of feline leukemia vaccination satisfactory?" }, { path: "felineHIV", label: "Is the proof of feline HIV vaccination satisfactory?" }]} />
