// This exports the Stories group for this component

import {CommonModule} from "@angular/common";
import {Story} from "@storybook/angular/types-6-0";
import {moduleMetadata, storiesOf} from "@storybook/angular";
import {NgDraggableResizableModule} from "@rivenfx/ng-draggable-resizable";
import {BasicComponent} from "./basic/basic.component";
import {BasicMinWidthHeightComponent} from "./basic/basic-min-width-height.component";


const common = {
  moduleMetadata: {
    imports: [CommonModule, NgDraggableResizableModule],
    schemas: [],
    declarations: [BasicComponent],
  }
};


storiesOf('Examples/Basics', module)
  .add('Basic', () => {
    return {
      component: BasicComponent,
      ...common
    };
  })
  .add('minWidth-minHeight', () => {
    return {
      component: BasicMinWidthHeightComponent,
      ...common
    };
  })
  .add('maxWidth-maxHeight', () => {
    return {
      component: BasicMinWidthHeightComponent,
      ...common
    };
  })
;

//
// export default {
//   // The title defines the name and where in the structure of
//   // Storybook's menu this is going to be placed.
//   // Here we add it to a "Components" section under "Link"
//   title: 'Examples/Basics',
//   // The component related to the Stories
//   component: BasicComponent,
//   decorators: [
//     // The necessary modules for the component to work on Storybook
//     moduleMetadata({
//       declarations: [
//         BasicComponent,
//         BasicMinWidthHeightComponent
//       ],
//       imports: [CommonModule, NgDraggableResizableModule],
//     }),
//   ],
// };
// // This creates a Story for the component
// const BasicTemplate: Story<BasicComponent> = () => ({
//   component: BasicComponent
// });
// export const Basic = BasicTemplate.bind({});
//
//
// const BasicMinWidthHeightTemplate: Story<BasicMinWidthHeightComponent> = () => ({
//   component: BasicComponent
// });
// export const BasicMinWidthHeight = BasicMinWidthHeightTemplate.bind({});
