<script lang="ts">
  import { FieldRadio, FieldTextInput } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="scored" number legendText="Applicant acknowledges participation expectations." items={[{ label: "Worst", value: 1 }, { label: "Below Average", value: 2 }, { label: "Average", value: 3 }, { label: "Above Average", value: 4 }, { label: "Best", value: 5 }]} />
<FieldTextInput path="explanation" labelText="Explain your score." />
