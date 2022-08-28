using System;
using System.Drawing;
using System.Collections;
using System.ComponentModel;
using System.Windows.Forms;
using System.Data;

using System.Threading;
using Branching;

namespace ThreadTesting
{
	/// <summary>
	/// Summary description for Form1.
	/// </summary>
	public class Form1 : System.Windows.Forms.Form
	{
		private System.Windows.Forms.Button button1;
		private System.Windows.Forms.Button button2;
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.Container components = null;

		public Form1()
		{
			//
			// Required for Windows Form Designer support
			//
			InitializeComponent();

			//
			// TODO: Add any constructor code after InitializeComponent call
			//
		}

		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		protected override void Dispose( bool disposing )
		{
			if( disposing )
			{
				if (components != null) 
				{
					components.Dispose();
				}
			}
			base.Dispose( disposing );
		}

		#region Windows Form Designer generated code
		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
			this.button1 = new System.Windows.Forms.Button();
			this.button2 = new System.Windows.Forms.Button();
			this.SuspendLayout();
			// 
			// button1
			// 
			this.button1.Location = new System.Drawing.Point(224, 16);
			this.button1.Name = "button1";
			this.button1.Size = new System.Drawing.Size(56, 40);
			this.button1.TabIndex = 0;
			this.button1.Text = "Go";
			this.button1.Click += new System.EventHandler(this.button1_Click);
			// 
			// button2
			// 
			this.button2.Location = new System.Drawing.Point(136, 64);
			this.button2.Name = "button2";
			this.button2.Size = new System.Drawing.Size(72, 48);
			this.button2.TabIndex = 1;
			this.button2.Text = "Show";
			// 
			// Form1
			// 
			this.AutoScaleBaseSize = new System.Drawing.Size(5, 13);
			this.ClientSize = new System.Drawing.Size(292, 266);
			this.Controls.Add(this.button2);
			this.Controls.Add(this.button1);
			this.Name = "Form1";
			this.Text = "Form1";
			this.ResumeLayout(false);

		}
		#endregion

		/// <summary>
		/// The main entry point for the application.
		/// </summary>
		[STAThread]
		static void Main() 
		{
			Application.Run(new Form1());
		}

		private void button1_Click(object sender, System.EventArgs e)
		{
			System.Threading.Timer timer = new System.Threading.Timer(new System.Threading.TimerCallback(onTimer), null, 0, 50);

            Branch.AddBranch(new ThreadStart(MyFunc));
		}

		public void MyFunc()
		{
			TimeScale tc = new TimeScale( 3000, this.button2.Width, 120, 20);
			while (tc.Going)
			{
				this.button2.Width = (int)tc.Value;
				Branch.SleepFrame();
			}
		}

		protected void onTimer(object sender)
		{
			Branch.RunFrame();
		}
	}
}
