using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using Assessment.Web.Helpers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Assessment.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            IWebHost host = BuildWebHost(args);

            //using (IServiceScope scope = host.Services.CreateScope())
            //{
            //    IServiceProvider services = scope.ServiceProvider;
            //    try
            //    {
            //        IDatabaseInitializer databaseInitializer = services.GetRequiredService<IDatabaseInitializer>();
            //        databaseInitializer.SeedAsync().Wait();
            //    }
            //    catch (Exception ex)
            //    {
            //        ILogger<Program> logger = services.GetRequiredService<ILogger<Program>>();
            //        logger.LogCritical(LoggingEvents.INIT_DATABASE, ex, LoggingEvents.INIT_DATABASE.Name);
            //    }
            //}

            host.Run();
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