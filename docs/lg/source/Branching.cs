using System;
using System.Threading;
using System.Collections;

namespace Branching
{
	public class TimeScale
	{
		private double[] vals, work;
		private double duration, start;
		public bool isgoing;

		public bool Going
		{
			get { return isgoing; }
		}

		public double Value
		{
			get
			{
				if (!isgoing)
					return vals[vals.Length-1];

				double ct = (Branch.CurrentTime - start)/duration;
				if ((ct >= 1.0) || (vals.Length==1))
				{
					isgoing = false;
					return vals[vals.Length-1];
				}

				double ot = 1-ct;
				int i;
				for (i=0; i<vals.Length-1; i++)
				{
					work[i] = vals[i]*ot + vals[i+1]*ct;
				}

				int len = vals.Length-1;
				while (len > 1)
				{
					for (i=0; i<len; i++)
					{
						work[i] = work[i]*ot + work[i+1]*ct;
					}
					len--;
				}
				return work[0];
			}
		}

		public TimeScale(double dur, params double[] avals)
		{
			start = Branch.CurrentTime;
			vals = avals;
			work = new double[vals.Length];
			duration = dur;

			isgoing = true;
		}
	}

	public class Branch
	{
		private static ArrayList branches = new ArrayList();
		public static void AddBranch(ThreadStart ts)
		{
			Branch par = CurrentBranch;
			Branch nb = new Branch(ts);
			nb.parent = par;
			branches.Add( nb );
		}

		private static double _curtime = 0;
		public static double CurrentTime
		{
			get
			{
				return _curtime;
			}
		}

		private static Branch CurrentBranch
		{
			get
			{
				int ti = Thread.CurrentThread.GetHashCode();
				for(int i=0; i<branches.Count; i++)
				{
					Branch br = (Branch)branches[i];
					if (br.thread.GetHashCode() == ti)
					{
						return br;
					}
				}
				return null;
			}
		}

		public static void WaitOnBranches()
		{
			bool found = true;
			int tbi = Branch.CurrentBranch.thread.GetHashCode();
			while(found)
			{
				found = false;
				if (!found) //if is just to reduce the stack
				{
					for (int i=0; (!found) && (i<branches.Count); i++)
					{
						Branch br = (Branch)branches[i];
						br = br.parent;
						while (br!=null)
						{
							if (br.thread.GetHashCode() == tbi)
							{
								if (br.thread.ThreadState != ThreadState.Aborted)
									found = true;
							}
							br = br.parent;
						}
					}
				}

				if (found)
					SleepFrame();
			}
		}

		public static void SleepFrame()
		{
			Thread.CurrentThread.Suspend();
		}

		public static void Sleep(double milliseconds)
		{
			Branch br = Branch.CurrentBranch;
			br.IsTimeSleep = true;
			br.WakeUpTime = Branch.CurrentTime + milliseconds;
			Thread.CurrentThread.Suspend();
		}

		private static ArrayList runframeobj = new ArrayList();
		public static bool RunFrame()
		{
			if (!Monitor.TryEnter(runframeobj))
				return false;

			_curtime = (double)Environment.TickCount;

			for (int i=0; i<branches.Count; i++)
			{
				Branch br = (Branch)branches[i];

				switch(br.thread.ThreadState)
				{
					case ThreadState.Unstarted:
						br.thread.Start();
						break;
					case ThreadState.Suspended:
					{
						if (br.IsTimeSleep)
						{
							if (br.WakeUpTime <= Branch.CurrentTime)
							{
								br.IsTimeSleep = false;
								br.thread.Resume();
							}
						}
						else
							br.thread.Resume();
					}
						break;
				}

				while (br.thread.ThreadState == ThreadState.Running)
				{
					Thread.Sleep(10);
				}
			}

			Monitor.Exit(runframeobj);
			return true;
		}

		private Thread thread;
		private bool IsTimeSleep;
		private double WakeUpTime;
		private Branch parent;
		private Branch(ThreadStart ts)
		{
			thread = new Thread(ts);
			IsTimeSleep = false;
		}

		public override int GetHashCode()
		{
			return thread.GetHashCode();
		}

	}
}
