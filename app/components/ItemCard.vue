<template>

<article class="relative grid grid-cols-[minmax(0,1fr)_auto] py-5">

    <div class="min-w-0">
        <h2 class="font-serif text-lg leading-snug text-highlighted sm:text-xl">
            <NuxtLink :to="`/items/${props.item.id}`" class="after:absolute after:inset-0 hover:underline hover:decoration-1 hover:underline-offset-4">
                {{ title }}
            </NuxtLink>
        </h2>

        <p v-if="props.item.status === 'pending'" class="mt-1 text-sm italic text-muted">Reading the page…</p>
        <p v-else-if="props.item.status === 'failed'" class="mt-1 text-sm text-muted">Couldn't read this page. You can still open the original.</p>
        <p v-else-if="props.item.description" class="mt-1.5 line-clamp-2 text-[0.9375rem] leading-relaxed text-muted">{{ props.item.description }}</p>
    </div>

    <img
        v-if="props.item.imageUrl && !imageBroken"
        :src="props.item.imageUrl"
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        class="mt-1 ml-4 h-14 w-20 rounded-sm bg-elevated object-cover grayscale sm:row-span-2 sm:ml-6 sm:h-20 sm:w-28"
        @error="imageBroken = true"
    >

    <div class="col-span-2 mt-2 flex items-center gap-3 self-end text-sm text-dimmed sm:col-span-1 sm:col-start-1">
        <span v-if="props.item.title" class="truncate">{{ host }}</span>
        <span v-if="props.item.type === 'video'" class="shrink-0">Video</span>
        <NuxtTime :datetime="props.item.createdAt" day="numeric" month="short" class="shrink-0" />
        <button
            type="button"
            class="relative z-10 ml-auto shrink-0 text-dimmed underline-offset-4 hover:text-highlighted hover:underline"
            @click="emit('delete',Number(props.item.id))"
        >Remove</button>
    </div>

</article>

</template>


<script setup lang="ts">
import type {ItemSummary} from '#shared/types/index'

const emit = defineEmits<{delete:[id:number]}>()
const props = defineProps<{item:ItemSummary}>()

const host = computed(()=> displayHost(props.item.url))
const title = computed(()=> props.item.title || host.value)
const imageBroken = ref(false)

</script>
