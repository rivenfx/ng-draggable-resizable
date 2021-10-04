// // also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
// import {Story, Meta} from '@storybook/angular/types-6-0';
// import {moduleMetadata} from "@storybook/angular";
// import {CommonModule} from "@angular/common";
// import {NgDraggableResizableModule} from "@rivenfx/ng-draggable-resizable";
// import {BrowserModule} from "@angular/platform-browser";
// import {BasicComponent} from "./basic.component";
//
// // // More on default export: https://storybook.js.org/docs/angular/writing-stories/introduction#default-export
// // export default {
// //   title: 'Example/基本',
// //   component: BasicComponent,
// //   decorators: [
// //     moduleMetadata({
// //       declarations: [BasicComponent],
// //       imports: [CommonModule, BrowserModule, NgDraggableResizableModule],
// //     }),
// //   ],
// // } as Meta;
// //
// // const BasicTemplate: Story<BasicComponent> = (args: BasicComponent) => ({
// //   props: args,
// // });
// //
// // export const BasicComponent = BasicTemplate.bind({});
// // BasicComponent.storyName = '基本使用';
//
// // This exports the Stories group for this component
// export default {
//   // The title defines the name and where in the structure of
//   // Storybook's menu this is going to be placed.
//   // Here we add it to a "Components" section under "Link"
//   title: 'Components/Link',
//   // The component related to the Stories
//   component: BasicComponent,
//   decorators: [
//     // The necessary modules for the component to work on Storybook
//     moduleMetadata({
//       declarations: [BasicComponent],
//       imports: [CommonModule, BrowserModule, NgDraggableResizableModule],
//     }),
//   ],
// };
// // This creates a Story for the component
// const Template: Story<BasicComponent> = () => ({
//   component: BasicComponent,
//   template: `
//     <div ngDraggableResizable>
//       <p>你可以拖着我，按照自己的意愿调整大小。</p>
//     </div>
//     `,
// });
// export const Base = Template.bind({});
// // Other stories could be added here as well, all you have to do is export them along!
