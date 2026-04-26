<!--
  QuestionnairePrompt — layout wrapper for prompt forms. Use as the
  outer `wrap:` of a `fields:` shorthand (SPECS.md §8) when the prompt
  benefits from a styled intro block, optional external links, and a
  centered/full-width container.

  Spec usage:
    ui:
      form:
        wrap:
          template: QuestionnairePrompt
          props:
            title: "Yard Information."
            description: "Please tell us about your yard."
            externalLinks:
              - { url: https://www.aspca.org/, label: "Yard Safety Tips" }
        fields: [ ... ]

  This is a project-agnostic copy of `ui/src/lib/components/QuestionnairePrompt.svelte`
  so generated projects do not need to import from the framework's `$lib`.
  Depends only on `carbon-components-svelte` + `carbon-icons-svelte`, which
  every ReqQuest UI already pulls in.
-->
<script lang="ts">
  import { Button } from 'carbon-components-svelte'
  import Launch from 'carbon-icons-svelte/lib/Launch.svelte'

  export let title: string = ''
  export let description: string = ''
  export let externalLinks: { url: string, label: string, target?: string, rel?: string }[] = []
  export let fullWidth: boolean = false
  export let align: 'left' | 'center' = 'center'
  export let introTextAlignment: 'left' | 'center' | 'right' | undefined = undefined

  $: effectiveIntroAlignment = introTextAlignment ?? align
</script>

{#if title || description}
  <div
    id="questionnaire-intro"
    class="prompt-intro flow max-w-screen-md px-6"
    class:mx-auto={align === 'center'}
    class:text-center={effectiveIntroAlignment === 'center'}
    class:text-right={effectiveIntroAlignment === 'right'}
    style:color="var(--cds-text-02)"
  >
    {#if title}<h2>{title}</h2>{/if}
    {#if description}<p>{description}</p>{/if}
  </div>
{/if}

{#if externalLinks.length > 0}
  <div class="prompt-intro-links flow max-w-screen-md px-6" class:mx-auto={align === 'center'}>
    <ul class="flex gap-4 flex-wrap mb-4" class:justify-center={align === 'center'}>
      {#each externalLinks.slice(0, 3) as link (link.url)}
        <li>
          <Button
            kind="ghost"
            icon={Launch}
            href={link.url}
            target={link.target ?? '_blank'}
            rel={link.rel ?? 'noopener noreferrer'}
          >
            {link.label}{#if (link.target ?? '_blank') === '_blank'}<span class="sr-only"> (opens in a new tab)</span>{/if}
          </Button>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<div
  class="px-6 prompt-form flow"
  class:max-w-screen-md={!fullWidth}
  class:w-full={fullWidth}
  class:mx-auto={align === 'center'}
>
  <slot />
</div>
