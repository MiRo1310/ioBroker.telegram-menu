![Logo](../../admin/telegram-menu.png)

## ioBroker telegram-menu Adapter

Easily create Telegram menus

The adapter is used to communicate with the ioBroker via Telegram, to switch data points or to take values from
query data points. For this purpose, different groups can be created in which menus can be created. These can be done
then assign to users.

Let's get started!

### Generally

-   Special settings can be found directly in the adapter and
    placed where they can be used.
    You can access the help texts using this button:![Button HelperText](../pic/btnHelperTexte.png)
-   **Important:**In order for the menu to be used, at least one menu must be activated under “Telegram users” in the adapter. 
    To do this, simply check the checkbox on the right.

### Navigation

![Navigation](../pic/nav.png)<br>Here you can see the navigation.

-   Line 1 (green) is the start navigation. This is sent when the adapter starts or restarts. Man
    but you can access it again at any time using a button.
-   The text on the right side (e.g. “Choose an action”) is freely selectable, but cannot be empty.
-   Buttons in a row are marked with a`,`separated.
-   A new line can be reached with the separator`&&`.

![Buttons in Telegram](../pic/image-1.png)<br>Here you can see the sent menu in Telegram. If you e.g. For example, if you press "Heating", "Heating" will be sent to the adapter as text
sent. This searches for the appropriate call text, which must be written exactly as in the image above. **Very important: Each name of the call text may only appear once, i.e. h. it must be unique.**

-   Various predefined submenus can be used, e.g. B. On-Off, percent or numbers (e.g. for the
    Roller shutter control). For this purpose, a new trigger is automatically created in the actions - more on this below.

-   It is possible to switch from one menu to another menu. This makes sense when two people share the same menu
    share, but User1 receives an additional menu that User2 should not have access to. In both
    The corresponding button is visible to groups, but with functionality that is only relevant for User1. With that
    For this to work, the respective user must be registered in both groups.

-   In order for the second menu (i.e. a submenu) to work, the homepage trigger text must be deactivated. Through
    deactivating it, the line turns orange and a message appears indicating that it is a submenu
    acts. You deactivate the row by leaving the "Trigger" cell empty. In older versions you had to`-`Enter – but this still works. Now User1 can access Menu 2 from Menu 1 by clicking on the
    presses the corresponding button. **Important: Even with two menus, each call text can only be used once
    occur!**

-   If there are two menus that do not have the same user, each menu can of course have an entry such as: B. have “light” – but not
    when jumping from one to the other.

#### When opening a navigation...

##### <span id="status"></span>...a status will be sent

-   To display the status of an ID when calling up a navigation or a submenu, the following entry can be made in the
    Return text can be used:`{status:'ID':true}`.
    "ID" must be replaced by the ID to be queried.
    The expression must be placed directly where the status is to be displayed.
-   **_Breaking Change!!!_**The parameter`true`indicates whether the value is passed through`change{"true":"an","false":"aus"}`may be changed. This is important if you have more than one
    want to query status in one call.<br>

##### ... the value of the status can be changed

-   If the value should be changed, e.g. B. from`true`to “on” and`false`too “off”.`change{"true":"an","false":"aus"}`used
    become.

##### ...a value can be set

-   Sets a data point when opening a navigation. The following can be used:`{set:'id':'ID',val,ack}`– “ID” is
    the ID of the data point into which a value is to be written. "val" is the value to be set, "ack" indicates whether the value
    should be set as confirmed or unconfirmed.

##### ...a timestamp will be sent

-   Sends a timestamp when opening a navigation.
-   For final editing:`{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}`
-   Otherwise:`{time.ts,(DD MM YYYY hh:mm:ss:sss),id:'ID'}`– “ID” is the ID of the data point to be queried. In the brackets
    The format can be customized: Individual placeholders may be removed, but not renamed
    become. Exception:`YYYY`can also be used as`YY`be used.

##### ...add a line break to the text

-   At the desired location`\n`register.

##### ...the status value is a Unix timestamp

-   To convert this to local time:`{time}`

##### ...use parse mode

-   Used to text**fett**`<b></b>`,_italics_`<i></i>`, as Code`<code></code>`or as a link`<a href="URL">Link</a>`to represent. It is possible that additional tags will be supported.
-   To use this, activate the “Parse Mode” checkbox and insert the text between the tags.

#### Icons in den Menü-Buttons

![Icon1](../pic/heizung-icon1.png)

-   If you want to have special icons in the menu buttons, copy an emoji
    (e.g. from<https://www.getemojis.net/html/#Emoji-Liste>) and use it like a character, or you can simply use`Windows + .`. The code of the emoji is not copied, but the emoji directly!

![Icon2](../pic/heizung-icon2.png)

#### Clear history

To delete all messages (similar to “Delete history” in the client), add a menu item`menu:deleteAll:Navigation`a. **Navigation**  ist der Menü-Name, der anschließend aufgerufen werden soll (
z. B. Startseite). Es können nur Einträge gelöscht werden, die jünger als 48 Stunden sind.

### Submenüs

![Submenus](../pic/image10.png)

-   The menus are entered into the navigation in order to call them up.
-   The TRIGGER must always be a unique name, meaning it can only appear once, and refers to the
    Trigger in the action where the ID is specified.


     menu:switch-on.true-off.false:TRIGGER:

-   Any value can be replaced. "on" and "off" are the button labels. "true" and "false" automatically become Booleans
    converted, but can also be replaced with text.


    menu:percent10:TRIGGER:

-   Die`10`is variable and specifies the step size. It can simply be replaced with another number.


    menu:number1-20-2-unit:TRIGGER:

-   `1`and`20`indicate the range (can also be the other way around:`20-1`),`2`the step size. For a negative value, easy`(-)`write in front of the number. "unit" is the unit. Everything can be replaced variably, e.g. b.`menu:number16-36-4-°C:temperaturXY:`


    menu:dynSwitch[Name1|value1, Name2|value2, value3]:TRIGGER:LengthOfRow:

-   This can be used to create a dynamic menu. In an array`[]`always contains the name to be displayed and the value
    (`Name|Wert`). Alternatively, just the value - then the button is labeled with the value.`LengthOfRow`specifies how many buttons should be next to each other.**_Breaking Change!!!_** Please change manually:`[Name1:Value1, Name2:Value2]`change to`[Name1|Value1, Name2|Value2]`. Decimal numbers can now also be used as values
    be used, e.g. b.`2.5`.
    A value of a data point can now also be used as a name:`{status:'ID':true}`–<a href="#status">for more
    See information here</a>.


    menu:back

-   Switches back to the previously accessed page. A maximum of 20 pages can be returned.

    <br>
    <img src="../pic/menu_percent10_r2.png" width="800"/>
    <img src="../pic/submenu_setstate.png" width="800"/>

### SetState

![SetState](../pic/setState.png)

-   The “Switch” checkbox on the right only switches Booleans. It alternates between`true`and`false`when calling the shutter button.
    The trigger has the exact name of the button that should trigger the action.
-   Under “Value” you can enter other values ​​that should be set. Each value must have a separate SetState entry
    be created.
-   It is possible to have the setting of the value confirmed, **as soon as`ack:true`was set**. The placeholder
    for the value is`&&`. Basically all states are included`ack:false`set – this is required
    if you want to use it to control other adapters. A confirmation only occurs when the addressed adapter
    Value up`ack:true`has set. Would you like?`ack:true`If you set it manually, simply tick “Ack”.<br>

* * *

    {novalue}

-   If you do not want to have the set value sent, this will be entered in the return text.<br>![novalue](../pic/image5.png)<br>

* * *

-   If you set a state and want to receive the change of another state, use the following in the return text.
    Replace “ID” with the desired ID. The text can also be customized.
    The change will only be sent if the State is set to`ack:true`was set.

## Note - there has been a change here

In most cases the change should have been applied automatically. Please check whether it works as desired.

### Neu

```
 {"foreignId":"id","text":"Wert wurde gesetzt:"} 

```

<details>
  <summary>Alte Version anzeigen (ausklappbar)</summary>

### Old (obsolete)

     {'id':'ID','text':'Wert wurde gesetzt:'} 

## </details>

    {setDynamicValue:RequestText:Type:ConfirmText:ID:}

-   **To set a text or number data point:** For example, if you want For example, if you write text to a data point, it waits
    Instance after pressing the button on an input. The selected data point is then displayed with the entered text
    described. This is entered in the return field.
    -   **RequestText**– Prompt text for input
    -   **Type**–`boolean`,`number`or`string`
    -   **ConfirmText**– Confirmation text after setting the data point, can be replaced with your own text.
    -   **ID**– Optional: ID of another data point whose confirmation value is displayed in the return text. Only values ​​are included`ack:true`sent. is a placeholder for the value`&&`.

* * *

    {confirmSet:The value has been set:noValue}

-   This can be used to confirm the setting of a value. However, this does not mean that an adapter has this value
    actually processed.

* * *

##### Parse Mode, change, newline

-   See section[Navigation](#navigation).

#### Influence a value from a submenu

-   To achieve this, simply create the submenu as usual. Then with SetState the static part as the value
    insert and as a placeholder for the value from the submenu`{value}`set.

#### Set a static value with a dynamic value of an ID

-   You can define a static part in the value and one in front of it, in between or behind it
    Insert dynamic part. The dynamic part looks like this:`{id:ID}`, where "ID" must be replaced by the desired ID.

#### Here are a few examples

Input – the data point has the value in this case`true`or`false`:

    {id:0_userdata.0.Fenster.Fenster_Status} 

Output:

    true 

Input – the data point has the value`5`, this is multiplied by 2:

    {id:0_userdata.0.Count} {math:*2} 

Output:

    10

Input – the data point has the value`5`, is multiplied by 2, with additional text:

    Test {id:0_userdata.0.Count} {math:*2} Test 

Output – the result is always appended at the end unless you use the wildcard`&&`:

    Test Test 10

Input – with placeholder`&&`:

    Test && {id:0_userdata.0.Count} {math:*2} Test  Oder Test && Test {id:0_userdata.0.Count} {math:*2}

Output – the placeholder is replaced by the result:

    Test 10 Test

Input – you can also exchange the result. The data point still has the value`5`:

    Status &&  {id:0_userdata.0.Count} {math:*2} change{"10":"an", "20":"aus"}

Output – the placeholder is replaced with the exchanged value:

    Status an

* * *

### GetState

-   With`&&`You can place the value in the text as a placeholder. Just like with SetState, you can influence the value
    with`change{"true":"an", "false":"aus"}`.
-   If you need to read a value from a data point and convert it, you can do so in the return text`{math:/10}`insert – here e.g. E.g. divided by 10.![math](../pic/image9.png)<br>
-   If you want to round the value, you can do so`{round:2}`.
-   If you want to retrieve several values at the same time, you can activate the "Newline" checkbox to...
    every query to get the return text displayed on a new line.
-   If you want to convert a Unix timestamp to a local time, add
    in the return text`{time}`at the desired location.

#### Values ​​from created functions

-   To retrieve all values ​​of a configured function, simply write instead of the ID`functions=Licht`(Example).
-   If you want to display the name of the data point in the output text, enter it at the desired position in the text`{common.name}`a.

![functions](../pic/functions.png)<br>

-   **The table**<br>**_Breaking Change!!!_**

The type of input has changed. From now on it must be valid JSON so that the table can be displayed correctly.

`{"tableData":[{"key":"value-1-inJSON","label":"Name"},{"key":"value-2-inJSON","label":"NameTH-Col1"}],"tableLabel":"ShoppingList","type":"TextTable"}`

Display a JSON as a TextTable:

1.  Under “ID” select a data point that contains a JSON.
2.  Enter and adapt the JSON in the text field as described above.
    In`tableData`is the`key`equal to the key from the JSON.`label`is the name of the table column. If it is omitted, the`key`used as a column name.
3.  `tableLabel`is the heading of the table. It can also be an empty string - then no heading will be displayed.
4.  `type`is the type of table and must remain unchanged.

`{"tableData":[{"key":"name"}],"tableLabel":"ShoppingList","listName":"SHOP","type":"alexaShoppingList"}`

-   This creates a list of buttons for the`alexa-shoppinglist`-Adapter. The buttons remove the respective item from the list of the Alexa2 adapter. The`key`for the data from the JSON is in this case`name`. For the whole thing to work, it has to
    the data point used from`alexa-shoppinglist`-Adapter the stem.
-   `listName`is the name of the list created in Alexa, e.g. b.`SHOP`or`TOBUY`. This must match the list from which the data is retrieved.

![InlineTable](../pic/inlinetable-grafik.png)![TextTable](../pic/textable-grafik.png)

### Send Picture

-   You can insert a token for Grafana in the settings.
-   A directory with full write permissions must be created, e.g. b.`/opt/iobroker/grafana/`to get there
    To be able to cache images.
-   The rendering URL must be specified in the action. This can be found in Grafana under: Diagram → Share → (Time range
    deactivate lock so that the current diagram is always sent) → Direct link to the rendered image.
-   If you send several diagrams, the file name must be different, otherwise the images will be mutually exclusive
    overwrite.
-   **Innovation:**From now on you can turn the delay on`0`to send the image without delay.
-   If the delay is > 0, the image will be sent delayed by the specified value (in seconds).

    <img src="../pic/grafana.png" width="400"></img>

### Send Location

-   First select the trigger.
-   Then a data point for the latitude (`latitude`) and one for longitude (`longitude`) can be specified.

### Events

-   Integrated event listener: Waits for a data point - if this is set (e.g. via a script or a
    Adapter), a predefined menu opens.
-   The specified condition is checked.
-   From version > 1.7.3 you can`=`,`!=`,`<`,`>`,`<=`,`>=`select as condition. If nothing is selected,
    checked for equality by default.
-   It will be on`ack`checked.

### Echarts

-   This makes it possible to have diagrams sent directly from the Echarts adapter.
-   **Preset**can be taken directly from the object structure.
-   **Background**– the background can be set here.
-   **Theme**– different themes can be set from the Echarts adapter, e.g. b.`auto, default, dark, dark-bold, dark-blue, gray, vintage, macarons, infographic, shine, roma, azul, blue, royal, tech-blue, red, red-velvet, green`.
-   **filename**– individual file name. **Important: A directory must be included in the settings
    full write permission must be specified.**

### HTTP Request

-   This makes it possible to send an HTTP request – with or without authentication. The first thing you need to do is the URL
    be specified. User and password are optional; If not needed, just leave it blank. As a file name
    the preconfigured name can remain.

### Settings

-   **Telegram instance**– Here you can choose between the instances if you have several installed.
-   **Text for no entry**– The entered text is sent if no suitable menu entry was found. This can be deactivated using the checkbox next to it.
-   **Resize Keyboard**– Prompts clients to adjust the size of the keyboard vertically for optimal fit
    (e.g. making the keyboard smaller if there are only two rows of keys). Default value:`false`– the custom keyboard will then always have the same height as the standard keyboard
    app.[Telegram API](https://core.telegram.org/bots/api#replykeyboardmarkup)
-   **One Time Keyboard**- Prompts clients to hide the keyboard once it is in use. The keyboard remains
    still available, but clients automatically display the normal letter keyboard in chat. The user
    can show the user-defined keyboard again using a special button in the input field. Default value:`false`.[Telegram API](https://core.telegram.org/bots/api#replykeyboardmarkup)
-   **Grafana Token**– Optional: Token to fetch charts from Grafana.
-   **directory**– For caching charts (needed for Grafana and Echarts). It must be full
    Write permissions exist for this directory.
-   **Send menu after restart**– Can be deactivated. If the option is deactivated, the menu must
    the first time can be accessed manually via the input field in the Telegram app.
