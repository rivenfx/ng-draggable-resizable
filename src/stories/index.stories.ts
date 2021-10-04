// This exports the Stories group for this component
import {BasicComponent} from "./basic/basic.component";
import {moduleMetadata} from "@storybook/angular";
import {CommonModule} from "@angular/common";
import {Story} from "@storybook/angular/types-6-0";
import {NgDraggableResizableModule} from "@rivenfx/ng-draggable-resizable";

export default {
  // The title defines the name and where in the structure of
  // Storybook's menu this is going to be placed.
  // Here we add it to a "Components" section under "Link"
  title: 'Examples/Basics',
  // The component related to the Stories
  component: BasicComponent,
  decorators: [
    // The necessary modules for the component to work on Storybook
    moduleMetadata({
      declarations: [BasicComponent],
      imports: [CommonModule,NgDraggableResizableModule],
    }),
  ],
};
// This creates a Story for the component
const Template: Story<BasicComponent> = () => ({
  component: BasicComponent
});
export const basic = Template.bind({});
// Other stories could be added here as well, all you have to do is export them along!
