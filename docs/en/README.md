![Logo](../../admin/telegram-menu.png)

## ioBroker telegram-menu adapter

Easily create Telegram Menus

You can create a separate menu for each user, or you can use the global user to generate the same menu for all users.

### Navigation

![Navigation](../pic/nav.png)

-   Navigation must be saved for triggers to be updated in actions
-   The call text is called via the button, both must have the same name
-   Buttons must be separated by , and lines by &&
-   All users must be spelled exactly as they were created in Telegram
-   Each button may only appear once

### SetState

-   Switch only toggles booleans, from true to false to true etc.
-   If you specify a value, you can set it

### GetState

-   You can place the Value in the Text with && as placeholder

### Send Picture

-   in the settings you can add a token for Grafana
-   A directory must be created in which you have all rights, e.g. /opt/iobroker/grafana/ , in order to be able to save the images there
-   In action you have to specify the rendering URL, this can be found in Grafana on the diagram -> share -> (take out the time range lock so that the current diagram is always sent) -> direct link to the rendered image
-   If you send several diagrams, the file names must be different, otherwise the images will overwrite each other
-   Delay the time between the request and the sending of the image -> depending on the speed of the system, a different value can and must be taken

![Grafana](../pic/grafana.png)