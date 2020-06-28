import tkinter as tk
from number_entry import IntEntry


def main():
    # Create the root Tk object.
    app = tk.Tk()

    # Create a HeartWindow object which will call
    # the __init__ function in the HeartWindow class.
    HeartWindow(app)

    # Start the tkinter loop that processes user events
    # such as key presses and mouse button clicks.
    app.mainloop()


class HeartWindow(tk.Frame):
    """The main window of this application."""

    def __init__(self, parent):
        """Initialize a Frame object."""

        # Call __init__ in the parent class.
        super().__init__(parent)

        # Create a label that displays "Age:"
        lblAge = tk.Label(self, text="Age:")

        # Create a text field where the user will enter her age.
        txtAge = IntEntry(self, 1, 90, width=5)


        # This function is called each time the user releases a key.
        def calc(event):
            """Compute and display the user's slowest
            and fastest beneficial heart rates.
            """
            try:
                # Get the user's age.
                age = txtAge.get()

                # Compute the user's maximum heart rate.
                max = 220 - age

                # Compute the user's slowest and
                # fastest beneficial heart rates.
                slow = round(max * 0.65)
                fast = round(max * 0.85)

                # Display the slowest and fastest benficial
                # heart rates for the user to see.
                lblSlow.configure(text=str(slow))
                lblFast.configure(text=str(fast))

            except ValueError:
                # When the user deletes all the digits in the age
                # text field, clear the slowest and fastest labels.
                lblSlow.configure(text="")
                lblFast.configure(text="")


        # Bind the calc function to the age text field so
        # that the calc function will be called when the
        # user changes the text in the text field.
        txtAge.bind("<KeyRelease>", calc)

        # Create a label that acts as empty space.
        space = tk.Label(self, width=3)

        # Create a label that displays "Rates:"
        lblRates = tk.Label(self, text="Rates:")

        # Create labels that will display the output.
        lblSlow = tk.Label(self, width=4)
        lblFast = tk.Label(self, width=4)

        # This function is called each time
        # the user presses the "Clear" button.
        def clear():
            """Clear all the inputs and outputs."""
            txtAge.clear()
            lblSlow.configure(text="")
            lblFast.configure(text="")
            txtAge.focus()

        # Create the Clear button.
        btnClear = tk.Button(self, text="Clear", command=clear)

        # Layout all the labels, text fields, and buttons in a grid.
        lblAge.grid(  row=0, column=0, padx=3, pady=2)
        txtAge.grid(  row=0, column=1, padx=3, pady=2)
        space.grid(   row=0, column=2, padx=3, pady=2)
        lblRates.grid(row=0, column=3, padx=3, pady=2)
        lblSlow.grid( row=0, column=4, padx=3, pady=2)
        lblFast.grid( row=0, column=5, padx=3, pady=2)
        btnClear.grid(row=1, column=0, padx=3, pady=2, columnspan=6, sticky="W")

        self.master.title("Heart Rate")
        self.grid(padx=3, pady=3)

        # Give the age text field the keyboard focus.
        txtAge.focus()


# Call the main function so that
# this program will start executing.
main()
