<template>
  <div class="q-py-xs">
    <q-card
      class="q-py-sm"
      :class="{
        'bg-accent': zero,
        'bg-grey-3': one,
        'bg-grey-4': two,
        'shadow-5': expanded,
      }"
      :flat="nest !== 0"
    >
      <div class="flex justify-between items-center">
        <span v-handle class="drag-handle">
          <q-icon
            round
            flat
            name="mdi-drag-horizontal-variant"
            :disable="dragging"
            size="24px"
          />
        </span>
        <span class="delete">
          <q-btn
            round
            flat
            outline
            icon="mdi-delete"
            @click.prevent="$emit('delete')"
          />
        </span>
      </div>

      <q-expansion-item
        v-model="expanded"
        label="test"
        :disable="dragging"
        :group="group"
      >
        <template v-slot:header>
          <q-item class="full-width">
            <q-item-section avatar> </q-item-section>
            <q-item-section>
              <q-item-label v-if="localMenu.text" class="ellipsis text-bold">{{
                localMenu.text
              }}</q-item-label>
              <q-item-label v-else class="ellipsis text-bold"
                >Menu item</q-item-label
              >
              <q-item-label
                v-if="localMenu.items && localMenu.items.length"
                caption
                class="ellipsis"
              >
                {{ localMenu.items.length }} sub items
              </q-item-label>
              <q-item-label v-else-if="localMenu.link" caption class="ellipsis">
                {{ localMenu.link }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <q-card
          :class="{ 'bg-accent': zero, 'bg-grey-3': one, 'bg-grey-4': two }"
        >
          <q-card-section>
            <div class="q-gutter-y-md">
              <q-input
                label="Text label"
                outlined
                v-model="localMenu.text"
                color="secondary"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-tag" />
                </template>
              </q-input>
              <q-input
                label="Link"
                hint="Leave empty when using sub items"
                outlined
                v-model="localMenu.link"
                color="secondary"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-link" />
                </template>
              </q-input>
              <q-input
                label="Active match patern"
                hint="Regex, for example: ^/(guide|style-guide|cookbook|examples)/"
                dense
                outlined
                v-model="localMenu.activeMatchPatern"
                color="secondary"
              />
              <!-- <div v-if="nest < 2"> -->
              <!-- <template #item="{ element }"> -->

              <div class="q-pl-md menuItemContainer q-pb-sm" v-if="nest < 2">
                <div class="q-mb-sm">
                  <SlickList
                    axis="y"
                    v-model:list="localMenu.items"
                    useDragHandle
                    lockAxis="y"
                    helperClass="drag-item"
                    v-if="localMenu.items"
                  >
                    <SlickItem
                      v-for="(menuItem, index) in localMenu.items"
                      :key="menuItem.id"
                      :index="index"
                    >
                      <NavigationMenuItem
                        :menu="menuItem"
                        :nest="nest + 1"
                        @delete="deleteMenuItem(index)"
                        :group="accordionGroupID"
                        :touched="touched"
                      />
                    </SlickItem>
                  </SlickList>
                </div>

                <q-btn
                  label="Add sub item"
                  no-caps
                  color="secondary"
                  outline
                  icon="mdi-plus"
                  @click="addItem()"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-card>
  </div>
</template>
<script>
// import draggable from "vuedraggable";
// import { ElementMixin, HandleDirective } from "vue-slicksort";
import { SlickList, SlickItem } from "vue-slicksort";
import { HandleDirective } from "vue-slicksort";
export default {
  name: "NavigationMenuItem",
  components: {
    SlickList,
    SlickItem,
  },
  directives: { handle: HandleDirective },
  props: {
    nest: {
      type: Number,
      default: 0,
    },
    menu: {
      required: true,
      type: Object,
    },
    dragging: {
      type: Boolean,
    },
    group: {
      required: true,
      type: String,
    },
    touched: {
      type: Boolean,
      required: true,
    },
  },
  data: function () {
    return {
      localMenu: this.menu,
      expanded: this.touched,
      text: null,
      link: null,
      activeMatchPatern: null,
      subItems: [],
      accordionGroupID: this.mixin_randomID(),
    };
  },
  watch: {
    localMenu: {
      handler(newLocalMenu) {
        this.$emit("update", newLocalMenu.items);
      },
      deep: true,
    },
  },
  methods: {
    addItem() {
      if (this.localMenu.items) {
        this.localMenu.items.push({ text: "", id: this.mixin_randomID() });
      } else {
        this.localMenu.items = [{ text: "", id: this.mixin_randomID() }];
      }
    },
    deleteMenuItem(index) {
      this.localMenu.items.splice(index, 1);
    },
  },
  computed: {
    zero: function () {
      return this.nest === 0;
    },
    one: function () {
      return this.nest === 1;
    },
    two: function () {
      return this.nest === 2;
    },
  },
};
</script>
<style scoped lang="scss">
.q-card {
  transition: 0.3s box-shadow;
}
.flex {
  height: 0;
}
.drag-handle,
.delete {
  z-index: 1;
  height: 74px;
  display: flex;
  align-items: center;
}
.drag-handle {
  width: 64px;
  padding-right: 12px;
  justify-content: flex-end;
  cursor: move;
  user-select: none;
}
.delete {
  z-index: 1;
  margin-right: 64px;
}
.q-item {
  min-height: 58px;
}
.menuItemContainer {
  border-left: 8px solid $grey-5;
}
.q-item.full-width {
  max-width: calc(100% - 32px);
}
.ellipsis {
  max-width: calc(100% - 48px);
}
</style>
