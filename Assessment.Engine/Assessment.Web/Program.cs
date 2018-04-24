using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using Assessment.Web.Helpers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MediaTypeNames = System.Net.Mime.MediaTypeNames;

namespace Assessment.Web
{
    public class Program
    {
        private static TextWriter _consoleOut;
        private static readonly CancellationTokenSource CancelTokenSource = new CancellationTokenSource();

        public static void Main(string[] args)
        {
            IWebHost host = BuildWebHost(args);
            Console.WriteLine("Starting Calculations Server...");
            _consoleOut = Console.Out;  //Save the reference to the old out value (The terminal)
            Console.SetOut(new StreamWriter(Stream.Null));  //Remove the console output
            host.Start();   //Start the host in a non-blocking way
            Console.SetOut(_consoleOut);    //Put the console output back, after the messages has been written

            Console.CancelKeyPress += OnConsoleCancelKeyPress;
            WaitHandle[] waitHandles = new WaitHandle[] {
                CancelTokenSource.Token.WaitHandle
            };
            WaitHandle.WaitAll(waitHandles);
        }

        /// <summary>
        /// This method is meant as an eventhandler to be called when the Console received a cancel signal.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private static void OnConsoleCancelKeyPress(object sender, ConsoleCancelEventArgs e)
        {
            //Got Ctrl+C from console
            Console.WriteLine("Shutting down.");
            CancelTokenSource.Cancel();
        }


        public static IWebHost BuildWebHost(string[] args)
        {
            Assembly assembly = typeof(Program).Assembly;
            Stream certificateStream = assembly.GetManifestResourceStream("Assessment.Web.Resources.localhost.pfx");
            X509Certificate2 serverCertificate;
            using (MemoryStream memoryStream = new MemoryStream())
            {
                certificateStream.CopyTo(memoryStream);
                serverCertificate = new X509Certificate2(memoryStream.ToArray(), "FreedomDev");
            }

            int availablePort = GetAvailablePort(5000);
            if (availablePort > 5010)
                throw new Exception("No available port");


            return new WebHostBuilder()
                .UseStartup<Startup>()
                .UseKestrel(options => { options.Listen(IPAddress.Any, availablePort, listenOptions =>
                    {
                        listenOptions.UseHttps(serverCertificate);
                    }); }).Build();
        }

        public static int GetAvailablePort(int startingPort)
        {
            List<int> portArray = new List<int>();

            IPGlobalProperties properties = IPGlobalProperties.GetIPGlobalProperties();

            //getting active connections
            TcpConnectionInformation[] connections = properties.GetActiveTcpConnections();
            portArray.AddRange(connections.Where(n => n.LocalEndPoint.Port >= startingPort)
                .Select(n => n.LocalEndPoint.Port));

            //getting active tcp listners - WCF service listening in tcp
            IPEndPoint[] endPoints = properties.GetActiveTcpListeners();
            portArray.AddRange(endPoints.Where(n => n.Port >= startingPort).Select(n => n.Port));

            //getting active udp listeners
            endPoints = properties.GetActiveUdpListeners();
            portArray.AddRange(endPoints.Where(n => n.Port >= startingPort).Select(n => n.Port));

            portArray.Sort();

            for (int i = startingPort; i < ushort.MaxValue; i++)
                if (!portArray.Contains(i))
                    return i;

            return 0;
        }
    }
}