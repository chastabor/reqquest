<script lang="ts">
  import { FieldNumber } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldNumber path="minExerciseHours" labelText="Minimum Exercise Per Week" helperText="How many hours per week is the applicant required to exercise their dog, on average?" />
