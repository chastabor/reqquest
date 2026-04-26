<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="seemsNice" boolean labelText="This applicant seems like a nice person." items={[{ label: "No", value: false }, { label: "Yes", value: true }]} />
